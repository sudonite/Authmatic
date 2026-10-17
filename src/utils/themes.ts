const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

const DEFAULT_THEME = "night";

const themes = [
    'abyss',
    'acid',
    'aqua',
    'autumn',
    'black',
    'bumblebee',
    'business',
    'caramellatte',
    'cmyk',
    'coffee',
    'corporate',
    'cupcake',
    'cyberpunk',
    'dark',
    'dim',
    'dracula',
    'emerald',
    'fantasy',
    'forest',
    'garden',
    'halloween',
    'lemonade',
    'light',
    'lofi',
    'luxury',
    'night',
    'nord',
    'pastel',
    'retro',
    'silk',
    'sunset',
    'synthwave',
    'valentine',
    'winter',
    'wireframe',
];

function applyTheme(theme: string): void {
    document.documentElement.dataset.theme = theme;
}

export { capitalize, themes, applyTheme, DEFAULT_THEME };