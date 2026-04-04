import fs from 'fs';

const filePath = 'f:\\DADOS\\CURSO SITE\\MARKETING DIGITAL\\APP\\NovoSmartCartao\\src\\pages\\AdminProducts.tsx';

try {
    let content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    let cleanedLines = [];
    let i = 0;

    console.log('Iniciando scan de reparo...');

    while (i < lines.length) {
        let line = lines[i];

        // 1. Corrigir a transição no nicho de veículos
        if (line.includes('placeholder="Ex: Preta"') && i + 1 < lines.length && lines[i+1].includes('/>')) {
            // Verificamos se as próximas linhas são a transição corrompida
            if (lines[i+2].includes(') : (') || lines[i+2].includes(')  :  (')) {
                cleanedLines.push(line);
                cleanedLines.push(lines[i+1]);
                cleanedLines.push('                      </div>');
                cleanedLines.push('                    </div>');
                cleanedLines.push('                  </div>');
                cleanedLines.push('                ) : (');
                cleanedLines.push('                  <div className="space-y-6">');
                
                // Pula a linha corrompida ( ) : ( e a próxima <div...
                i += 3;
                while (i < lines.length && !lines[i].includes('<div className="grid')) {
                    i++;
                }
                console.log('Transição de nichos corrigida.');
                continue;
            }
        }

        // 2. Remover o bloco residual "e\""
        if (line.includes('e"') && i + 1 < lines.length && lines[i+1].includes('/>')) {
            console.log('Detectado resíduo "e". Eliminando...');
            while (i < lines.length && !lines[i].includes(')}')) {
                i++;
            }
            continue;
        }

        cleanedLines.push(line);
        i++;
    }

    fs.writeFileSync(filePath, cleanedLines.join('\n'));
    console.log('Reparo concluído com sucesso via Node (ESM)! 🚀🛡️');
} catch (err) {
    console.error('Erro no reparo:', err);
    process.exit(1);
}
