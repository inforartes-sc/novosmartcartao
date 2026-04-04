import os

file_path = r'f:\DADOS\CURSO SITE\MARKETING DIGITAL\APP\NovoSmartCartao\src\pages\AdminProducts.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
skip = False
for i, line in enumerate(lines):
    # Encontrar a transição corrompida entre nichos
    if "placeholder=\"Ex: Preta\"" in line and "/>" in lines[i+1] and " ) : (" in lines[i+2]:
        new_lines.append(line)
        new_lines.append(lines[i+1])
        new_lines.append("                      </div>\n")
        new_lines.append("                    </div>\n")
        new_lines.append("                  </div>\n")
        new_lines.append("                ) : (\n")
        skip = True
        continue
    
    if skip:
        if " <div className=\"space-y-6\">" in line:
            # Pula a linha corrompida atual e continua a partir daqui
            skip = False
        continue
        
    # Limpar a duplicata residual que identifiquei no view final
    if i > 792 and "e\"" in line and "/>" in lines[i+1]:
        # Pula esse trecho sujo até o fechamento correto )}
        offset = 1
        while i + offset < len(lines) and ")}" not in lines[i + offset]:
            offset += 1
        # Não adiciona nada e avança o loop principal
        # Mas como estamos num loop for, vamos usar um marcador de skip
        # Mas para simplificar, vamos apenas ignorar essa linha específica e as próximas
        # na verdade, o loop skip acima já deve tratar isso se for bem planejado.
        pass

# Vamos refazer o loop com uma lógica mais robusta de limpeza de duplicatas
cleaned_lines = []
i = 0
while i < len(lines):
    line = lines[i]
    
    # 1. Corrigir a transição no nicho de veículos
    if "placeholder=\"Ex: Preta\"" in line and i + 1 < len(lines) and "/>" in lines[i+1] and " ) : (" in lines[i+2]:
        cleaned_lines.append(line)
        cleaned_lines.append(lines[i+1])
        cleaned_lines.append("                      </div>\n")
        cleaned_lines.append("                    </div>\n")
        cleaned_lines.append("                  </div>\n")
        cleaned_lines.append("                ) : (\n")
        cleaned_lines.append("                  <div className=\"space-y-6\">\n")
        i += 4 # Pula o trecho corrompido
        continue
        
    # 2. Remover o bloco residual "e\""
    if "e\"" in line and i + 1 < len(lines) and "/>" in lines[i+1]:
        # Pula até o próximo )} que fecha o ternário
        while i < len(lines) and ")}" not in lines[i]:
            i += 1
        continue

    cleaned_lines.append(line)
    i += 1

with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(cleaned_lines)

print("Reparo concluído com sucesso! 💎✨")
