import type { House, ChecklistItem, StatusInfo, ChecklistItemState, User, ScheduledInspection } from './types';

export const USERS: Record<string, User> = {
    'william@uxua.com': { name: 'William', role: 'dev' },
    'viviane@uxua.com': { name: 'Viviane', role: 'manager' },
    'thiago@uxua.com': { name: 'Thiago', role: 'supervisor' },
    'vagner@uxua.com': { name: 'Vagner', role: 'supervisor' },
    'keny@uxua.com': { name: 'Keny', role: 'technician' },
    'bruno@uxua.com': { name: 'Bruno', role: 'technician' },
    'romario@uxua.com': { name: 'Romario', role: 'technician' },
};

export const TECHNICIANS: string[] = ['William', 'Viviane', 'Thiago', 'Vagner', 'Keny', 'Bruno', 'Romario', 'Outro (Anotar em Observação)'];
        
export const HOUSES: House[] = [
    { id: 'casa_eugenia', name: 'Eugénia' },
    { id: 'casa_lago', name: 'Lago' },
    { id: 'casa_sr_joao', name: 'Sr. João' },
    { id: 'casa_arvore', name: 'Arvore' },
    { id: 'casa_estudio', name: 'Estudio' },
    { id: 'casa_quintal', name: 'Quintal' },
    { id: 'casa_terraco', name: 'Terraço' },
    { id: 'casa_wilbert', name: 'Wilbert' },
    { id: 'casa_luz', name: 'Luz' },
    { id: 'casa_ceramica', name: 'Cerámica' },
    { id: 'casa_gulab', name: 'Gulab' },
    { id: 'casa_pedrinho', name: 'Pedrinho' },
    { id: 'casa_ze_zilda', name: 'Zé e Zilda' },
    { id: 'casa_irenio', name: 'Irénio' },
    { id: 'casa_casinha', name: 'Casinha' },
    { id: 'casa_beco', name: 'Beco' },
    { id: 'casa_artes', name: 'Artes' },
    { id: 'casa_anderson_mel_rosen', name: 'Andersen e Mel Rosen' },
];

// MOCK DATA - This will be replaced by a database
export let HOUSES_TO_INSPECT: string[] = ['casa_eugenia', 'casa_lago']; // Array of house IDs

export const MOCK_SCHEDULED_INSPECTIONS: ScheduledInspection[] = [
    {
        id: '1',
        houseId: 'casa_eugenia',
        houseName: 'Eugénia',
        technicianName: 'Keny',
        scheduledDate: new Date(new Date().setDate(new Date().getDate() + 2)),
        type: 'Preventiva',
        status: 'Agendada'
    },
    {
        id: '2',
        houseId: 'casa_lago',
        houseName: 'Lago',
        technicianName: 'Bruno',
        scheduledDate: new Date(new Date().setDate(new Date().getDate() -1)),
        type: 'Corretiva',
        status: 'Concluída'
    },
     {
        id: '3',
        houseId: 'casa_arvore',
        houseName: 'Arvore',
        technicianName: 'Vagner',
        scheduledDate: new Date(new Date().setDate(new Date().getDate() + 5)),
        type: 'Pré Check-in',
        status: 'Agendada'
    }
];


export const STATUS_MAP: Record<number, StatusInfo> = {
    0: { label: 'Pendente', color: 'bg-gray-400', ring: 'ring-gray-300', icon: '❓', button: 'bg-gray-500 hover:bg-gray-600' },
    1: { label: 'OK (Verificado)', color: 'bg-green-500', ring: 'ring-green-300', icon: '✅', button: 'bg-green-600 hover:bg-green-700' },
    2: { label: 'Problema Resolvido', color: 'bg-indigo-500', ring: 'ring-indigo-300', icon: '🛠️', button: 'bg-indigo-600 hover:bg-indigo-700' },
    3: { label: 'Problema Persistente', color: 'bg-red-500', ring: 'ring-red-300', icon: '🚨', button: 'bg-red-600 hover:bg-red-700' },
};

export const INITIAL_STATE: ChecklistItemState = { status: 0, note: '', photos: [] };

export const CHECKLIST_ITEMS: ChecklistItem[] = [
    { id: 'ac_func', category: 'Climatização', description: 'Ar Condicionado (Funcionamento, Temperaturas)' },
    { id: 'ventiladores', category: 'Climatização', description: 'Ventiladores de Teto/Piso (Funcionamento, Ruído)' },
    { id: 'lampadas_geral', category: 'Iluminação', description: 'Todas as Lâmpadas (Acionamento, Intensidade)' },
    { id: 'dimmers', category: 'Iluminação', description: 'Dimmers e Luminárias Especiais (Regulagem)' },
    { id: 'tomadas', category: 'Iluminação', description: 'Tomadas (Aparência, Tensão de Saída - Teste)' },
    { id: 'vazamentos', category: 'Hidráulica', description: 'Vazamentos Visíveis (Sob pias, chuveiros, vasos)' },
    { id: 'pressao_agua', category: 'Hidráulica', description: 'Pressão da Água (Torneiras e Chuveiros)' },
    { id: 'descargas', category: 'Hidráulica', description: 'Descargas (Acionamento e Vedação)' },
    { id: 'ralos', category: 'Hidráulica', description: 'Ralos (Drenagem Rápida e Ausência de Cheiro)' },
    { id: 'aquecedor_gas', category: 'Hidráulica', description: 'Aquecedor a Gás (Funcionamento, Vazamentos)' },
    { id: 'portas_janelas', category: 'Estrutural', description: 'Portas, Janelas e Cortinas (Abertura, Travamento)' },
    { id: 'moveis', category: 'Estrutural', description: 'Móveis (Estabilidade, Danos visíveis, Ruídos)' },
    { id: 'acabamentos', category: 'Estrutural', description: 'Paredes/Teto (Infiltrações, Mofo, Pintura)' },
    { id: 'minibar', category: 'Eletro/Extras', description: 'Minibar/Geladeira (Funcionamento, Temperatura, Limpeza)' },
    { id: 'cofre', category: 'Eletro/Extras', description: 'Cofre (Testar Travamento e Resetar Senha)' },
    { id: 'av', category: 'Eletro/Extras', description: 'TV e Som (Canais, Conexões, Controles)' },
];
