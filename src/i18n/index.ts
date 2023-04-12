import enLangs from './locales/en.lang';
import viLangs from './locales/vi.lang';

const map = new Map<string, Map<string, string>>();

map.set('vi', viLangs);
map.set('en', enLangs);

export default map;
