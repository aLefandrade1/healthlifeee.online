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
  depoimentos: [],

  /* Carrossel de RESULTADOS de clientes do plano (antes e depois).
     SÓ fotos reais, enviadas pela própria cliente, com autorização por escrito
     para uso de imagem e nome. Fotos em toalha/img/ (retrato 3:4, de lado).
     Atenção: antes e depois não pode ir para anúncio da Meta, só para a página.
     { nome:'Maria', cidade:'Recife, PE', dias:21, antes:'img/res-maria-antes.jpg', depois:'img/res-maria-depois.jpg', texto:'frase curta dela (opcional)' } */
  resultados: []
};

/* ---------- modo de visualização: ?demo=carrossel mostra o layout com fotos de EXEMPLO
   (só aparece com esse link; visitante normal nunca vê) ---------- */
if (/[?&]demo=carrossel\b/.test(location.search) && !window.PROVA.resultados.length) {
  window.PROVA.resultados = [
    { nome: 'EXEMPLO 1', cidade: 'só layout, sem cliente real', dias: 21, antes: 'img/b-estufa.jpg', depois: 'img/b-lugar.jpg', texto: 'Aqui entra a frase da cliente.' },
    { nome: 'EXEMPLO 2', cidade: 'só layout, sem cliente real', dias: 21, antes: 'img/b-pochete.jpg', depois: 'img/b-lugar.jpg' },
    { nome: 'EXEMPLO 3', cidade: 'só layout, sem cliente real', dias: 21, antes: 'img/b-pos.jpg', depois: 'img/b-lugar.jpg' }
  ];
}

/* ---------- carrossel de resultados (não mexer) ---------- */
window.carrossel = function (titulo) {
  var R = (window.PROVA && window.PROVA.resultados) || [];
  if (!R.length) return '';
  function e(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  var h = '<div class="car-wrap">' + (titulo ? '<div class="center"><span class="kicker">' + e(titulo) + '</span></div>' : '') +
    '<div class="car" data-car>';
  R.forEach(function (r) {
    h += '<figure class="car-it"><div class="car-ph">' +
      '<div><img src="' + e(r.antes) + '" width="300" height="400" alt="" loading="lazy"><span>Antes</span></div>' +
      '<div><img src="' + e(r.depois) + '" width="300" height="400" alt="" loading="lazy"><span class="d">' + (r.dias ? e(r.dias) + ' dias' : 'Depois') + '</span></div>' +
      '</div><figcaption>' + (r.texto ? '<p>“' + e(r.texto) + '”</p>' : '') +
      '<b>' + e(r.nome) + '</b>' + (r.cidade ? ' · <span>' + e(r.cidade) + '</span>' : '') + '</figcaption></figure>';
  });
  h += '</div>' + (R.length > 1 ? '<div class="car-dots">' + R.map(function (_, i) { return '<i' + (i ? '' : ' class="on"') + '></i>'; }).join('') + '</div>' : '') +
    '<p class="cmt-src">Fotos enviadas por clientes do plano, com autorização. Resultados variam de pessoa para pessoa.</p></div>';
  return h;
};
/* liga as bolinhas ao arrastar (chamar depois de colocar o HTML na página) */
window.carrosselLiga = function (raiz) {
  (raiz || document).querySelectorAll('[data-car]').forEach(function (c) {
    var dots = c.parentNode.querySelectorAll('.car-dots i');
    if (!dots.length) return;
    c.addEventListener('scroll', function () {
      var i = Math.round(c.scrollLeft / c.firstChild.offsetWidth);
      dots.forEach(function (d, k) { d.classList.toggle('on', k === i); });
    }, { passive: true });
  });
};
