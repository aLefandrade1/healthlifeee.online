/* ============ PROVA SOCIAL E ESPECIALISTA (quiz + VSL) ============
   Tudo aqui é opcional: o que estiver vazio NÃO aparece na página.
   Regra: só conteúdo REAL. Nada de depoimento inventado.
=================================================================== */
window.PROVA = {

  /* Especialista que apresenta a técnica e as VSLs.
     Só preencher com autorização dela (nome, foto e fala).
     foto: arquivo em toalha/img/ (ex.: 'img/especialista.jpg') */
  especialista: {
    nome:   '',   // ex.: 'Yuki Tanaka'
    titulo: '',   // ex.: 'Fisioterapeuta em Tóquio · ensina a técnica há 8 anos'
    foto:   '',
    frase:  ''    // fala curta dela, entre aspas, ex.: 'A toalha certa no ponto certo muda tudo.'
  },

  /* Comentários REAIS em vídeos da técnica no TikTok (lá fora), traduzidos.
     Fonte: levantamento de 18/11/2026. l = curtidas do comentário. */
  comentarios: [
    { t: 'Finalmente o exercício pra minha preguiça 😂', l: '14,7 mil' },
    { t: 'Não queria acreditar, mas me sinto muito mais alinhada.', l: '3,3 mil' },
    { t: 'Drenagem linfática + toalha japonesa, combo 🔥', l: '1,5 mil' },
    { t: 'Doeu demais no começo, não consegui relaxar, mas depois as costas ficaram leves.', l: '831' },
    { t: 'Comecei hoje! 30 dias.', l: '984' }
  ],

  /* Depoimentos de CLIENTES do plano. Só com autorização por escrito.
     { nome:'Ana', cidade:'Campinas, SP', foto:'img/dep-ana.jpg', texto:'...' } */
  depoimentos: []
};
