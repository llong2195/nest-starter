import enLangs from './en.lang';
import viLangs from './vi.lang';

const map = new Map<string, Map<string, string>>();

map.set('vi', viLangs);
map.set('en-US', enLangs);

export default map;
