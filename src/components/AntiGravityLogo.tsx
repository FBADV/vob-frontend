import React from 'react';

/**
 * VOB Logo - Conceito "Rede da Justiça"
 * 
 * Esta logo foi projetada para ser compatível com efeitos de física/gravidade
 * (como Google Antigravity). Cada elemento é separado e pode cair individualmente.
 * 
 * ELEMENTOS SEPARADOS:
 * 1. Letra V (Azul Safira)
 * 2. Arco Superior do O
 * 3. Arco Inferior do O
 * 4. Nó Central Dourado (fulcro da balança)
 * 5. Letra B (Verde Esmeralda)
 * 6. Linhas de Conexão (4 linhas separadas)
 * 7. Nós de Conexão (pequenos círculos)
 */

interface AntiGravityLogoProps {
    size?: number;
    className?: string;
    // enablePhysics?: boolean; // Para ativar física no futuro (não implementado ainda)
}

export const VOBAntiGravityLogo: React.FC<AntiGravityLogoProps> = ({
    size = 200,
    className = ''
}) => {
    // Cores da paleta brasileira corporativa moderna
    const colors = {
        sapphireBlue: '#1E40AF',
        emeraldGreen: '#047857',
        golden: '#D97706',
        charcoal: '#374151',
        lineColor: '#94A3B8'
    };

    return (
        <svg
            width={size}
            height={size * 0.4} // Proporção horizontal
            viewBox="0 0 300 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            {/* ELEMENTO 1: Linha de Conexão V-O (esquerda) */}
            <line
                id="connection-line-1"
                className="vob-connection-line"
                x1="65"
                y1="60"
                x2="95"
                y2="60"
                stroke={colors.lineColor}
                strokeWidth="2"
                opacity="0.6"
            />

            {/* ELEMENTO 2: Linha de Conexão O-B (direita) */}
            <line
                id="connection-line-2"
                className="vob-connection-line"
                x1="175"
                y1="60"
                x2="205"
                y2="60"
                stroke={colors.lineColor}
                strokeWidth="2"
                opacity="0.6"
            />

            {/* ELEMENTO 3: Nó de Conexão Esquerdo */}
            <circle
                id="node-left"
                className="vob-node"
                cx="80"
                cy="60"
                r="4"
                fill={colors.sapphireBlue}
            />

            {/* ELEMENTO 4: Nó de Conexão Direito */}
            <circle
                id="node-right"
                className="vob-node"
                cx="190"
                cy="60"
                r="4"
                fill={colors.emeraldGreen}
            />

            {/* ELEMENTO 5: Letra V (Azul Safira) */}
            <g id="letter-v" className="vob-letter">
                <path
                    d="M 20 20 L 50 100 L 65 100 L 95 20 L 75 20 L 57.5 75 L 40 20 Z"
                    fill={colors.sapphireBlue}
                />
            </g>

            {/* ELEMENTO 6: Arco Superior do O */}
            <path
                id="o-top-arc"
                className="vob-o-part"
                d="M 105 60 A 30 30 0 0 1 165 60 L 165 45 A 35 35 0 0 0 105 45 Z"
                fill="url(#gradient-o-top)"
            />

            {/* ELEMENTO 7: Arco Inferior do O */}
            <path
                id="o-bottom-arc"
                className="vob-o-part"
                d="M 105 60 A 30 30 0 0 0 165 60 L 165 75 A 35 35 0 0 1 105 75 Z"
                fill="url(#gradient-o-bottom)"
            />

            {/* ELEMENTO 8: Nó Central Dourado (Fulcro da Balança) */}
            <circle
                id="o-center-fulcrum"
                className="vob-fulcrum"
                cx="135"
                cy="60"
                r="6"
                fill={colors.golden}
                stroke="#FFF"
                strokeWidth="1"
            />

            {/* ELEMENTO 9: Letra B (Verde Esmeralda) */}
            <g id="letter-b" className="vob-letter">
                <path
                    d="M 205 20 L 205 100 L 245 100 C 260 100 270 90 270 75 C 270 65 265 57 255 55 C 263 53 267 45 267 37 C 267 25 257 20 245 20 Z M 225 35 L 240 35 C 247 35 250 38 250 42 C 250 46 247 49 240 49 L 225 49 Z M 225 64 L 243 64 C 251 64 255 67 255 73 C 255 79 251 85 243 85 L 225 85 Z"
                    fill={colors.emeraldGreen}
                />
            </g>

            {/* Gradientes */}
            <defs>
                {/* Gradiente do arco superior do O (Azul -> Transição) */}
                <linearGradient id="gradient-o-top" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor={colors.sapphireBlue} />
                    <stop offset="100%" stopColor="#0891B2" />
                </linearGradient>

                {/* Gradiente do arco inferior do O (Transição -> Verde) */}
                <linearGradient id="gradient-o-bottom" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#0891B2" />
                    <stop offset="100%" stopColor={colors.emeraldGreen} />
                </linearGradient>
            </defs>
        </svg>
    );
};

/**
 * Componente com texto completo
 */
export const VOBAntiGravityLogoWithText: React.FC<{
    size?: number;
    showSubtitle?: boolean;
}> = ({ size = 200, showSubtitle = true }) => {
    return (
        <div className="flex flex-col items-center gap-2">
            <VOBAntiGravityLogo size={size} />
            {showSubtitle && (
                <div className="text-center">
                    <p className="text-sm font-semibold text-[rgb(var(--text-secondary))] tracking-wider">
                        VIRTUAL OFFICE BRAZIL
                    </p>
                </div>
            )}
        </div>
    );
};

/**
 * INSTRUÇÕES PARA IMPLEMENTAÇÃO COM FÍSICA (Matter.js / Box2D)
 * 
 * Para ativar o efeito "Google Antigravity", você precisará:
 * 
 * 1. Instalar biblioteca de física:
 *    npm install matter-js @types/matter-js
 * 
 * 2. Criar corpos físicos para cada elemento:
 *    - letter-v: Polígono triangular
 *    - o-top-arc: Corpo semicircular superior
 *    - o-bottom-arc: Corpo semicircular inferior
 *    - o-center-fulcrum: Círculo pequeno (como uma bola)
 *    - letter-b: Polígono complexo
 *    - connection-line-1 e 2: Retângulos finos
 *    - Nós: Círculos pequenos
 * 
 * 3. Aplicar propriedades físicas:
 *    - Massa diferente para cada elemento
 *    - Fricção e restituição (bounce)
 *    - Gravidade padrão ou customizada
 * 
 * 4. Sincronizar posição SVG com física:
 *    - Use Matter.Events.afterUpdate para atualizar transform dos elementos SVG
 * 
 * 5. Exemplo de código (pseudo):
 * 
 * const letterV = Matter.Bodies.fromVertices(x, y, vertices);
 * const fulcrum = Matter.Bodies.circle(135, 60, 6);
 * Matter.World.add(engine.world, [letterV, fulcrum, ...]);
 * 
 * Matter.Events.on(engine, 'afterUpdate', () => {
 *   document.getElementById('letter-v').setAttribute('transform', 
 *     `translate(${letterV.position.x}, ${letterV.position.y}) rotate(${letterV.angle})`
 *   );
 * });
 */

export default VOBAntiGravityLogo;
