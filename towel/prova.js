/* ============ PROVA SOCIAL E ESPECIALISTA (quiz + VSL) · VERSÃO EUA (inglês) ============
   Tudo aqui é opcional: o que estiver vazio NÃO aparece na página.
   Regra: só conteúdo REAL. Nada de depoimento inventado.
=================================================================== */
window.PROVA = {

  /* Especialista que apresenta a técnica e as VSLs.
     Só preencher com autorização dela (nome, foto e fala).
     foto: arquivo em towel/img/ (ex.: 'img/especialista.jpg') */
  especialista: {
    nome:   '',   // ex.: '[NOME DA ESPECIALISTA]'
    titulo: '',   // ex.: 'Physical therapist · teaching the technique for 8 years'
    foto:   '',
    frase:  ''    // fala curta dela, entre aspas, em INGLÊS, ex.: 'The right towel in the right spot changes everything.'
  },

  /* PRINTS de comentários REAIS em vídeos da técnica no TikTok (18/11/2026).
     Nome e foto à mostra: o usuário informou em 18/11/2026 que cada autora autorizou o uso.
     Guardar os prints dessas autorizações. Comentário NOVO só entra com nome/foto se também autorizar.
     A oferta vai rodar em INGLÊS (EUA): só comentários em inglês, sem tradução.
     img = print; trad = legenda opcional embaixo (deixar vazio).
     c1–c4: vídeo @harmoniehernandez1/7619790114381745421 (1,5 mi curtidas)
     (c5 = comentário em português, guardado em img/cmt-c5.png, fora da lista)
     Se img estiver vazio, mostra o texto t como cartão. */
  comentarios: [
    { img: 'img/cmt-c1.png?v=2', w: 768, h: 200, trad: '' },
    { img: 'img/cmt-c3.png?v=2', w: 768, h: 200, trad: '' },
    { img: 'img/cmt-c2.png?v=2', w: 768, h: 200, trad: '' },
    { img: 'img/cmt-c4.png?v=2', w: 768, h: 288, trad: '' }
  ],

  /* Depoimentos de CLIENTES do plano. Só com autorização por escrito.
     { nome:'Ashley', cidade:'Austin, TX', foto:'img/dep-ana.jpg', texto:'...' } */
  depoimentos: [],

  /* Carrossel de RESULTADOS de clientes do plano (antes e depois).
     SÓ fotos reais, enviadas pela própria cliente, com autorização por escrito
     para uso de imagem e nome. Fotos em towel/img/ (retrato 3:4, de lado).
     Atenção: antes e depois não pode ir para anúncio da Meta, só para a página.
     { nome:'Maria', cidade:'Orlando, FL', dias:21, antes:'img/res-maria-antes.jpg', depois:'img/res-maria-depois.jpg', texto:'frase curta dela (opcional)' } */
  resultados: []
};

/* ---------- modo de visualização: ?demo=carrossel mostra o layout com fotos de EXEMPLO
   (só aparece com esse link; visitante normal nunca vê) ---------- */
if (/[?&]demo=carrossel\b/.test(location.search) && !window.PROVA.resultados.length) {
  window.PROVA.resultados = [
    { nome: 'EXAMPLE 1', cidade: 'layout only, not a real customer', dias: 21, antes: 'img/b-estufa.jpg', depois: 'img/b-lugar.jpg', texto: 'The customer’s quote goes here.' },
    { nome: 'EXAMPLE 2', cidade: 'layout only, not a real customer', dias: 21, antes: 'img/b-pochete.jpg', depois: 'img/b-lugar.jpg' },
    { nome: 'EXAMPLE 3', cidade: 'layout only, not a real customer', dias: 21, antes: 'img/b-pos.jpg', depois: 'img/b-lugar.jpg' }
  ];
}

/* ---------- print de comentário (não mexer) ---------- */
window.cmtHTML = function (c) {
  function e(s){return String(s==null?'':s).replace(/[&<>"']/g,function(x){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]})}
  if (c.img) return '<figure class="cprint"><img src="' + e(c.img) + '" width="' + (c.w||768) + '" height="' + (c.h||200) + '" alt="" loading="lazy">' +
    (c.trad ? '<figcaption>“' + e(c.trad) + '”</figcaption>' : '') + '</figure>';
  return '<div class="cmt"><p>“' + e(c.t) + '”</p><span class="cmt-l">♥ ' + e(c.l) + '</span></div>';
};
window.CMT_FONTE = '<p class="cmt-src">Screenshots of real comments on TikTok videos of the technique · shared with permission</p>';

/* ---------- carrossel de resultados (não mexer) ---------- */
window.carrossel = function (titulo) {
  var R = (window.PROVA && window.PROVA.resultados) || [];
  if (!R.length) return '';
  function e(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  var h = '<div class="car-wrap">' + (titulo ? '<div class="center"><span class="kicker">' + e(titulo) + '</span></div>' : '') +
    '<div class="car" data-car>';
  R.forEach(function (r) {
    h += '<figure class="car-it"><div class="car-ph">' +
      '<div><img src="' + e(r.antes) + '" width="300" height="400" alt="" loading="lazy"><span>Before</span></div>' +
      '<div><img src="' + e(r.depois) + '" width="300" height="400" alt="" loading="lazy"><span class="d">' + (r.dias ? 'Day ' + e(r.dias) : 'After') + '</span></div>' +
      '</div><figcaption>' + (r.texto ? '<p>“' + e(r.texto) + '”</p>' : '') +
      '<b>' + e(r.nome) + '</b>' + (r.cidade ? ' · <span>' + e(r.cidade) + '</span>' : '') + '</figcaption></figure>';
  });
  h += '</div>' + (R.length > 1 ? '<div class="car-dots">' + R.map(function (_, i) { return '<i' + (i ? '' : ' class="on"') + '></i>'; }).join('') + '</div>' : '') +
    '<p class="cmt-src">Photos sent by women on the plan, shared with permission. Results vary from person to person.</p></div>';
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
