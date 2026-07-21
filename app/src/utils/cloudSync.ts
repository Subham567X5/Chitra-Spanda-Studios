const APP_KEY = 'ize8p2en';
const BASE_URL = 'https://keyvalue.immanuel.co/api/KeyVal';

// MDN-compliant Unicode escaping
function escapeUnicode(str: string): string {
  if (!str) return '';
  return str.replace(/[^\x00-\x7F]/g, (char) => {
    return `\\u{${char.codePointAt(0)!.toString(16)}}`;
  });
}

function unescapeUnicode(str: string): string {
  if (!str) return '';
  try {
    return str.replace(/\\u\{([0-9a-fA-F]+)\}/g, (_, hex) => {
      return String.fromCodePoint(parseInt(hex, 16));
    });
  } catch (e) {
    console.error('Failed to unescape unicode:', e);
    return str;
  }
}

// Legacy decode helper for previous session data
function decodeBase64ToUnicode(str: string): string {
  if (!str) return '';
  try {
    return decodeURIComponent(Array.prototype.map.call(atob(str), (c) => {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
  } catch (e) {
    return str;
  }
}

export async function fetchCloudValue(key: string, defaultValue: string): Promise<string> {
  try {
    const res = await fetch(`${BASE_URL}/GetValue/${APP_KEY}/${key}`);
    if (!res.ok) return defaultValue;
    const data = await res.json();
    if (data === null || data === undefined || data === '') {
      return defaultValue;
    }
    if (typeof data === 'string') {
      if (data.startsWith('__b64__:')) {
        return decodeBase64ToUnicode(data.substring(8));
      }
      return unescapeUnicode(data);
    }
    return data;
  } catch (e) {
    console.error(`Error fetching key ${key} from cloud:`, e);
    return defaultValue;
  }
}

export async function saveCloudValue(key: string, value: string): Promise<boolean> {
  try {
    const escapedValue = escapeUnicode(value);
    // We pass value as query parameter to bypass IIS path segment length limits (400 Bad Request)
    const url = `${BASE_URL}/UpdateValue?appkey=${APP_KEY}&key=${key}&value=${encodeURIComponent(escapedValue)}`;
    const res = await fetch(url, {
      method: 'POST'
    });
    if (!res.ok) return false;
    const data = await res.json();
    return data === true;
  } catch (e) {
    console.error(`Error saving key ${key} to cloud:`, e);
    return false;
  }
}

export interface CloudData {
  founderStory?: { title: string; body: string; image: string };
  journeySlides?: any[];
  leadershipPartners?: any[];
  milestones?: any[];
}

export async function loadAllFromCloud(
  defaultStory: any,
  defaultSlides: any[],
  defaultPartners: any[],
  defaultMilestones: any[]
): Promise<CloudData> {
  try {
    // Fetch story
    const [storyTitle, storyBody, storyImage] = await Promise.all([
      fetchCloudValue('story_title', defaultStory.title),
      fetchCloudValue('story_body', defaultStory.body),
      fetchCloudValue('story_image', defaultStory.image),
    ]);

    const founderStory = {
      title: storyTitle,
      body: storyBody,
      image: storyImage
    };

    // Fetch slide count or default to defaultSlides.length
    const slideCountStr = await fetchCloudValue('slide_count', String(defaultSlides.length));
    const slideCount = parseInt(slideCountStr) || defaultSlides.length;
    
    // Fetch all slides in parallel
    const slidePromises = [];
    for (let i = 0; i < slideCount; i++) {
      const defSlide = defaultSlides[i] || {};
      slidePromises.push(
        (async () => {
          // Try loading the unified JSON format and body in parallel
          const [slideJson, bodyText] = await Promise.all([
            fetchCloudValue(`slide_${i}_json`, ''),
            fetchCloudValue(`slide_${i}_body`, '')
          ]);
          
          if (slideJson) {
            try {
              const parsed = JSON.parse(slideJson);
              if (parsed && typeof parsed === 'object') {
                return {
                  ...parsed,
                  body: bodyText || parsed.body || ''
                };
              }
            } catch (e) {
              console.error(`Failed to parse slide_${i}_json:`, e);
            }
          }
          
          // Fallback to legacy individual fields if JSON not found
          const [id, title, subtitle, layout, image, highlightText, body, bulletsStr, gridItemsStr] = await Promise.all([
            fetchCloudValue(`slide_${i}_id`, defSlide.id || `slide-${i + 1}`),
            fetchCloudValue(`slide_${i}_title`, defSlide.title || ''),
            fetchCloudValue(`slide_${i}_subtitle`, defSlide.subtitle || ''),
            fetchCloudValue(`slide_${i}_layout`, defSlide.layout || 'image-right'),
            fetchCloudValue(`slide_${i}_image`, defSlide.image || ''),
            fetchCloudValue(`slide_${i}_highlightText`, defSlide.highlightText || ''),
            fetchCloudValue(`slide_${i}_body`, defSlide.body || ''),
            fetchCloudValue(`slide_${i}_bullets`, defSlide.bullets ? JSON.stringify(defSlide.bullets) : '[]'),
            fetchCloudValue(`slide_${i}_gridItems`, defSlide.gridItems ? JSON.stringify(defSlide.gridItems) : '[]'),
          ]);

          let bullets = [];
          let gridItems = [];
          try { bullets = JSON.parse(bulletsStr); } catch (e) {}
          try { gridItems = JSON.parse(gridItemsStr); } catch (e) {}

          const slide: any = {
            id,
            title,
            subtitle,
            layout: layout as any,
            image,
            body
          };
          if (highlightText) slide.highlightText = highlightText;
          if (bullets && bullets.length > 0) slide.bullets = bullets;
          if (gridItems && gridItems.length > 0) slide.gridItems = gridItems;
          return slide;
        })()
      );
    }

    const journeySlides = await Promise.all(slidePromises);

    // Fetch partners
    const partnerIdsStr = await fetchCloudValue('partner_ids', defaultPartners.map(p => p.id).join(','));
    const partnerIds = partnerIdsStr ? partnerIdsStr.split(',') : [];
    
    const partnerPromises = partnerIds.map(async (id) => {
      const defPartner = defaultPartners.find(p => p.id === id) || {};
      const [partnerJson, descriptionText] = await Promise.all([
        fetchCloudValue(`partner_${id}_json`, ''),
        fetchCloudValue(`partner_${id}_description`, '')
      ]);
      
      if (partnerJson) {
        try {
          const parsed = JSON.parse(partnerJson);
          if (parsed && typeof parsed === 'object') {
            return {
              id,
              ...parsed,
              description: descriptionText || parsed.description || ''
            };
          }
        } catch (e) {
          console.error(`Failed to parse partner_${id}_json:`, e);
        }
      }

      // Legacy fallback
      const [name, role, image, description] = await Promise.all([
        fetchCloudValue(`partner_${id}_name`, defPartner.name || ''),
        fetchCloudValue(`partner_${id}_role`, defPartner.role || ''),
        fetchCloudValue(`partner_${id}_image`, defPartner.image || ''),
        fetchCloudValue(`partner_${id}_description`, defPartner.description || ''),
      ]);
      return { id, name, role, image, description };
    });
    const leadershipPartners = await Promise.all(partnerPromises);

    // Fetch milestones
    const milestoneCountStr = await fetchCloudValue('milestone_count', String(defaultMilestones.length));
    const milestoneCount = parseInt(milestoneCountStr) || defaultMilestones.length;

    const milestonePromises = [];
    for (let i = 0; i < milestoneCount; i++) {
      const defMilestone = defaultMilestones[i] || {};
      milestonePromises.push(
        (async () => {
          const milestoneJson = await fetchCloudValue(`milestone_${i}_json`, '');
          if (milestoneJson) {
            try {
              const parsed = JSON.parse(milestoneJson);
              if (parsed && typeof parsed === 'object') {
                if (!parsed.icon || parsed.icon === '??' || parsed.icon.includes('?')) {
                  parsed.icon = defMilestone.icon || '🚀';
                }
                return parsed;
              }
            } catch (e) {
              console.error(`Failed to parse milestone_${i}_json:`, e);
            }
          }

          // Legacy fallback
          const [year, title, desc, icon, color] = await Promise.all([
            fetchCloudValue(`milestone_${i}_year`, defMilestone.year || ''),
            fetchCloudValue(`milestone_${i}_title`, defMilestone.title || ''),
            fetchCloudValue(`milestone_${i}_desc`, defMilestone.desc || ''),
            fetchCloudValue(`milestone_${i}_icon`, defMilestone.icon || '🚀'),
            fetchCloudValue(`milestone_${i}_color`, defMilestone.color || '#06b6d4'),
          ]);
          const resolvedIcon = (!icon || icon === '??' || icon.includes('?')) ? (defMilestone.icon || '🚀') : icon;
          return { year, title, desc, icon: resolvedIcon, color };
        })()
      );
    }
    const milestones = await Promise.all(milestonePromises);

    return {
      founderStory,
      journeySlides,
      leadershipPartners,
      milestones
    };
  } catch (error) {
    console.error('Error loading all data from cloud:', error);
    return {};
  }
}

export async function saveStoryToCloud(story: { title: string; body: string; image: string }): Promise<void> {
  const isBase64 = story.image && story.image.startsWith('data:');
  const imageToSave = isBase64 ? '' : story.image;
  
  await Promise.all([
    saveCloudValue('story_title', story.title),
    saveCloudValue('story_body', story.body),
    saveCloudValue('story_image', imageToSave)
  ]);
}

export async function saveSlidesToCloud(slides: any[]): Promise<void> {
  const oldSlideCountStr = await fetchCloudValue('slide_count', '0');
  const oldSlideCount = parseInt(oldSlideCountStr) || 0;

  const promises: Promise<any>[] = [
    saveCloudValue('slide_count', String(slides.length))
  ];

  slides.forEach((slide, idx) => {
    const isBase64 = slide.image && slide.image.startsWith('data:');
    const imageToSave = isBase64 ? '' : slide.image;

    const slideMeta = {
      id: slide.id || '',
      title: slide.title || '',
      subtitle: slide.subtitle || '',
      layout: slide.layout || 'image-right',
      image: imageToSave,
      highlightText: slide.highlightText || '',
      bullets: slide.bullets || [],
      gridItems: slide.gridItems || []
    };

    promises.push(
      saveCloudValue(`slide_${idx}_json`, JSON.stringify(slideMeta)),
      saveCloudValue(`slide_${idx}_body`, slide.body || '')
    );
  });

  // Clear any extra old slides from the cloud database so they are permanently deleted
  for (let idx = slides.length; idx < oldSlideCount; idx++) {
    promises.push(
      saveCloudValue(`slide_${idx}_json`, ''),
      saveCloudValue(`slide_${idx}_body`, ''),
      saveCloudValue(`slide_${idx}_id`, ''),
      saveCloudValue(`slide_${idx}_title`, ''),
      saveCloudValue(`slide_${idx}_subtitle`, ''),
      saveCloudValue(`slide_${idx}_layout`, ''),
      saveCloudValue(`slide_${idx}_image`, ''),
      saveCloudValue(`slide_${idx}_highlightText`, ''),
      saveCloudValue(`slide_${idx}_bullets`, ''),
      saveCloudValue(`slide_${idx}_gridItems`, '')
    );
  }

  await Promise.all(promises);
}

export async function savePartnersToCloud(partners: any[]): Promise<void> {
  const partnerIds = partners.map(p => p.id).join(',');
  const promises: Promise<any>[] = [
    saveCloudValue('partner_ids', partnerIds)
  ];

  partners.forEach(partner => {
    const isBase64 = partner.image && partner.image.startsWith('data:');
    const imageToSave = isBase64 ? '' : partner.image;

    const partnerMeta = {
      name: partner.name || '',
      role: partner.role || '',
      image: imageToSave
    };

    promises.push(
      saveCloudValue(`partner_${partner.id}_json`, JSON.stringify(partnerMeta)),
      saveCloudValue(`partner_${partner.id}_description`, partner.description || '')
    );
  });

  await Promise.all(promises);
}

export async function saveMilestonesToCloud(milestones: any[]): Promise<void> {
  const promises: Promise<any>[] = [
    saveCloudValue('milestone_count', String(milestones.length))
  ];

  milestones.forEach((m, idx) => {
    const milestoneData = {
      year: m.year || '',
      title: m.title || '',
      desc: m.desc || '',
      icon: m.icon || '🚀',
      color: m.color || '#06b6d4'
    };
    promises.push(
      saveCloudValue(`milestone_${idx}_json`, JSON.stringify(milestoneData))
    );
  });

  await Promise.all(promises);
}
