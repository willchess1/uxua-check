import type { House, ChecklistItem, StatusInfo, ChecklistItemState } from './types';

export const TECHNICIANS: string[] = ['José Silva', 'Maria Almeida', 'Pedro Santos', 'Carlos Ribeiro', 'Outro (Anotar em Observação)'];
        
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

export const STATUS_MAP: Record<number, StatusInfo> = {
    0: { label: 'Pendente', color: 'bg-gray-400', ring: 'ring-gray-300', icon: '❓', button: 'bg-gray-500 hover:bg-gray-600' },
    1: { label: 'OK (Verificado)', color: 'bg-green-500', ring: 'ring-green-300', icon: '✅', button: 'bg-green-600 hover:bg-green-700' },
    2: { label: 'Problema Resolvido', color: 'bg-indigo-500', ring: 'ring-indigo-300', icon: '🛠️', button: 'bg-indigo-600 hover:bg-indigo-700' },
    3: { label: 'Problema Persistente', color: 'bg-red-500', ring: 'ring-red-300', icon: '🚨', button: 'bg-red-600 hover:bg-red-700' },
};

export const INITIAL_STATE: ChecklistItemState = { status: 0, note: '' };

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
    { id: 'portas_travas', category: 'Estrutural', description: 'Portas (Abertura Suave, Travamento, Chaves)' },
    { id: 'janelas', category: 'Estrutural', description: 'Janelas e Cortinas (Acionamento, Vedação)' },
    { id: 'moveis', category: 'Estrutural', description: 'Móveis (Estabilidade, Danos visíveis, Ruídos)' },
    { id: 'acabamentos', category: 'Estrutural', description: 'Paredes/Teto (Infiltrações, Mofo, Pintura)' },
    { id: 'minibar', category: 'Eletro/Extras', description: 'Minibar/Geladeira (Funcionamento, Temperatura, Limpeza)' },
    { id: 'cofre', category: 'Eletro/Extras', description: 'Cofre (Testar Travamento e Resetar Senha)' },
    { id: 'av', category: 'Eletro/Extras', description: 'TV e Som (Canais, Conexões, Controles)' },
];
