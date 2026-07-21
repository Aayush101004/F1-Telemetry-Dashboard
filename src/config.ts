export const LOGOS: Record<string, string> = { mercedes: '/logos/mercedes.avif', ferrari: '/logos/ferrari.avif', redbull: '/logos/redbull.avif', mclaren: '/logos/mclaren.avif', alpine: '/logos/alpine.avif', aston_martin: '/logos/aston_martin.avif', williams: '/logos/williams.avif', haas: '/logos/haas.avif', racing_bulls: '/logos/racing_bulls.avif', audi: '/logos/audi.avif', cadillac: '/logos/cadillac.avif' };
export const CARS: Record<string, string> = { mclaren: '/cars/mclaren_car.png', redbull: '/cars/redbull_car.png', mercedes: '/cars/mercedes_car.png', ferrari: '/cars/ferrari_car.png', racing_bulls: '/cars/racing_bulls_car.png', williams: '/cars/williams_car.png', haas: '/cars/haas_car.png', alpine: '/cars/alpine_car.png', aston_martin: '/cars/aston_martin_car.png', audi: '/cars/audi_car.png', cadillac: '/cars/cadillac_car.png' };

export const DRIVER_IMAGES: Record<string, string> = {
    max_verstappen: '/drivers/Max Verstappen.avif', leclerc: '/drivers/Charles Leclerc.avif', norris: '/drivers/Lando Norris.avif',
    hamilton: '/drivers/Lewis Hamilton.avif', russell: '/drivers/George Russell.avif', piastri: '/drivers/Oscar Piastri.avif',
    sainz: '/drivers/Carlos Sainz.avif', alonso: '/drivers/Fernando Alonso.avif', perez: '/drivers/Sergio Perez.avif',
    albon: '/drivers/Alexander Albon.avif', stroll: '/drivers/Lance Stroll.avif', gasly: '/drivers/Pierre Gasly.avif',
    ocon: '/drivers/Esteban Ocon.avif', hulkenberg: '/drivers/Nico Hulkenberg.avif', magnussen: '/drivers/Kevin Magnussen.avif',
    bottas: '/drivers/Valtteri Bottas.avif', zhou: '/drivers/Guanyu Zhou.avif', tsunoda: '/drivers/Yuki Tsunoda.avif',
    ricciardo: '/drivers/Daniel Ricciardo.avif', bearman: '/drivers/Oliver Bearman.avif', colapinto: '/drivers/Franco Colapinto.avif',
    antonelli: '/drivers/Andrea Kimi Antonelli.avif', doohan: '/drivers/Jack Doohan.avif', bortoleto: '/drivers/Gabriel Bortoleto.avif',
    lindblad: '/drivers/Arvid Lindblad.avif', hadjar: '/drivers/Isack Hadjar.avif', lawson: '/drivers/Liam Lawson.avif',
    default: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23475569'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E"
};

export const TEAM_COLORS: Record<string, string> = { mercedes: '#00A19B', ferrari: '#EF1A2D', redbull: '#3671C6', mclaren: '#FF8700', alpine: '#0093CC', aston_martin: '#229971', williams: '#00A0DE', haas: '#B6BABD', racing_bulls: '#6692FF', audi: '#F30000', cadillac: '#979797' };
export const TEAM_DISPLAY_NAMES: Record<string, string> = { mclaren: 'McLaren F1 Team', redbull: 'Oracle Red Bull Racing', mercedes: 'Mercedes-AMG Petronas F1 Team', ferrari: 'Scuderia Ferrari HP', racing_bulls: 'Visa Cash App RB F1 Team', williams: 'Williams Racing', haas: 'MoneyGram Haas F1 Team', alpine: 'BWT Alpine F1 Team', aston_martin: 'Aston Martin Aramco F1 Team', audi: 'Audi Factory F1 Team', cadillac: 'Cadillac Andretti F1 Team' };

export function getNormalizedTeamKey(rawConstructorId?: string): string {
    if (!rawConstructorId) return 'audi';
    const cid = rawConstructorId.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (cid.includes('mercedes')) return 'mercedes';
    if (cid.includes('ferrari')) return 'ferrari';
    if (cid.includes('mclaren')) return 'mclaren';
    if (cid.includes('alpine')) return 'alpine';
    if (cid.includes('redbull') || cid.includes('red_bull')) return 'redbull';
    if (cid.includes('aston') || cid.includes('amr')) return 'aston_martin';
    if (cid.includes('williams')) return 'williams';
    if (cid.includes('haas')) return 'haas';
    if (cid.includes('rb') || cid.includes('racingbulls') || cid.includes('alphatauri') || cid.includes('vcarb')) return 'racing_bulls';
    if (cid.includes('audi') || cid.includes('sauber') || cid.includes('kick')) return 'audi';
    if (cid.includes('cadillac') || cid.includes('andretti')) return 'cadillac';
    return 'audi';
}

export function getDriverFuzzyImage(dId: string): string {
    const fuzzyKey = Object.keys(DRIVER_IMAGES).find(k => k !== 'default' && (k.toLowerCase().includes(dId.toLowerCase()) || dId.toLowerCase().includes(k.toLowerCase())));
    return fuzzyKey ? DRIVER_IMAGES[fuzzyKey] : DRIVER_IMAGES.default;
}