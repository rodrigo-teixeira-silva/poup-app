# Poup (React Native / Expo / TypeScript)

App criado a partir da planilha `Compromisso_melhorado.xlsx`.

## Como rodar

1. Instale o Node.js (versão LTS).
2. No terminal, dentro desta pasta:

   npm install
   npx expo install --fix
   npx expo start

3. Abra o app **Expo Go** no celular e leia o QR code (ou pressione `a` para Android / `i` para iOS no emulador).

`npx expo install --fix` ajusta as versões das bibliotecas para a versão do Expo Go que você tem instalada.

## TypeScript

- Todo o código do app está em TypeScript (`.ts` / `.tsx`) com `strict` ligado; os tipos do domínio estão em `src/types.ts`.
- Os arquivos de configuração (`babel.config.js`) continuam em JavaScript, que é o padrão do Expo.
- Para checar os tipos: `npm run typecheck`.

## Telas

- **Início**: cabeçalho azul-marinho com o nome Poup, positivo do mês, medidor de gasto, atalhos, aviso de pendências e últimos lançamentos.
- **Resumo**: positivo do ano, os 12 meses com barra de % da renda gasta (vermelho acima do alerta) e destaques.
- **Mês**: positivo, renda, gastos, pendente e Caju; gastos por categoria; lançamentos (toque no status para alternar Pago/Pendente; toque na linha para editar; botão "Novo gasto").
- **Parcelas**: progresso de cada parcelamento, saldo restante e última parcela.
- **Ajustes**: renda base, limite de alerta, categorias e restaurar dados da planilha.

## Observações

- Os dados ficam salvos no aparelho (AsyncStorage). Os valores iniciais estão em `src/data/seed.ts`.
- Todas as fórmulas da planilha estão em `src/utils.ts`.
- Em Setembro e Outubro a planilha tinha duas colunas de valor; o app usa a primeira e mostra a segunda como "Valor alt." na linha.
