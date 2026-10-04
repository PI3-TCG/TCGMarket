# Button — Referência V1

| Variante      | Uso                                | Cor padrão    | **Cor Hover** | **Focus** | Texto/Ícone | Borda     | Exemplos                                                                                 |
| ------------- | ---------------------------------- | ------------- | ------------- | --------- | ----------- | --------- | ---------------------------------------------------------------------------------------- |
| **Primary**   | Ação principal da tela             | `#660366`     | `#4F024F`     | `#1688F8` | `#FFFFFF`   | —         | Explorar agora · Comprar carta · Finalizar compra · Publicar anúncio · Salvar alterações |
| **Secondary** | Ação importante alternativa        | `#1688F8`     | `#0969D7`     | `#1688F8` | `#FFFFFF`   | —         | Criar anúncio · Adicionar à coleção · Fazer proposta · Enviar mensagem · Confirmar troca |
| **Outline**   | Ação secundária ou alternativa     | `transparent` | `#F0E3F0`     | `#1688F8` | `#660366`   | `#660366` | Ver catálogo · Ver detalhes · Editar anúncio · Filtrar resultados · Gerenciar coleção    |
| **Ghost**     | Ação de baixa prioridade           | `transparent` | `#F0E3F0`     | `#1688F8` | `#660366`   | —         | Cancelar · Voltar · Limpar filtros · Fechar · Ver mais                                   |
| **Danger**    | Ações destrutivas ou irreversíveis | `#B91C1C`     | `#991B1B`     | `#1688F8` | `#FFFFFF`   | —         | Excluir anúncio · Remover carta · Excluir conta · Cancelar anúncio · Remover da coleção  |

| Propriedade                 | Valor                         |
| --------------------------- | ----------------------------- |
| **Fonte**                   | Plus Jakarta Sans             |
| **Peso**                    | 600                           |
| **Tamanho**                 | 14px                          |
| **Altura**                  | 40px                          |
| **Padding horizontal**      | 16px                          |
| **Border Radius**           | 8px                           |
| **Ícone**                   | 20px                          |
| **Espaçamento ícone/texto** | 8px                           |
| **Transição**               | Curta e sutil                 |
| **Sombra**                  | `shadow-sm` quando necessário |


| Propriedade        | Valor                                              |
| ------------------ | -------------------------------------------------- |
| **Focus ring**     | `#1688F8` — Secondary 500                          |
| **Aplicação**      | Todas as variantes de Button                       |
| **Objetivo**       | Indicar claramente que o botão está focado         |
| **Comportamento**  | Anel externo ao botão                              |
| **Acessibilidade** | O foco não deve depender somente da mudança de cor |

| Estado       | Comportamento                                         |
| ------------ | ----------------------------------------------------- |
| **Default**  | Aparência padrão da variante                          |
| **Hover**    | Aplicação da cor Hover definida para a variante       |
| **Active**   | Indica visualmente que o botão está sendo pressionado |
| **Focus**    | Focus ring `#1688F8`                                  |
| **Disabled** | Redução de contraste e interação desabilitada         |
| **Selected** | Indicação visual de seleção, quando aplicável         |

