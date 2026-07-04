/*
 * 체크리스트 진행률 저장 (localStorage)
 * 키: imtwin:<pageId>:<checkKey> = "1"
 * file:// 환경에서 localStorage가 막힌 경우 조용히 비활성화된다.
 */
(function () {
  "use strict";

  var PREFIX = "imtwin:";
  var store = null;
  try {
    localStorage.setItem(PREFIX + "__t", "1");
    localStorage.removeItem(PREFIX + "__t");
    store = localStorage;
  } catch (e) {
    return; // 저장 불가 환경: 체크는 동작하되 새로고침 시 초기화됨
  }

  function key(pageId, checkKey) {
    return PREFIX + pageId + ":" + checkKey;
  }

  function countDone(pageId) {
    var done = 0;
    var head = PREFIX + pageId + ":";
    for (var i = 0; i < store.length; i++) {
      var k = store.key(i);
      if (k && k.indexOf(head) === 0 && store.getItem(k) === "1") done++;
    }
    return done;
  }

  /* ----- 스텝 페이지: 체크박스 복원·저장 ----- */
  var pageId = document.body.getAttribute("data-page");
  if (pageId) {
    var boxes = Array.prototype.slice.call(
      document.querySelectorAll('.checks input[type="checkbox"][data-key]')
    );
    var counter = document.querySelector("[data-check-count]");

    function refreshCounter() {
      if (!counter) return;
      var done = boxes.filter(function (b) { return b.checked; }).length;
      counter.textContent = done + " / " + boxes.length + " 완료";
    }

    boxes.forEach(function (box) {
      var k = key(pageId, box.getAttribute("data-key"));
      if (store.getItem(k) === "1") box.checked = true;
      box.addEventListener("change", function () {
        if (box.checked) store.setItem(k, "1");
        else store.removeItem(k);
        refreshCounter();
      });
    });
    refreshCounter();
  }

  /* ----- 인덱스: 스텝별·전체 진행률 표시 ----- */
  var cards = Array.prototype.slice.call(
    document.querySelectorAll("[data-progress-for]")
  );
  if (cards.length) {
    var totalAll = 0;
    var doneAll = 0;
    cards.forEach(function (el) {
      var pid = el.getAttribute("data-progress-for");
      var total = parseInt(el.getAttribute("data-total"), 10) || 0;
      var done = Math.min(countDone(pid), total);
      totalAll += total;
      doneAll += done;
      var slot = el.querySelector("[data-done-label]");
      if (slot) {
        slot.textContent = done + "/" + total;
        if (done === total && total > 0) slot.classList.add("badge--done");
      }
    });
    var fill = document.querySelector("[data-progress-fill]");
    var label = document.querySelector("[data-progress-percent]");
    if (fill && totalAll > 0) {
      var pct = Math.round((doneAll / totalAll) * 100);
      fill.style.width = pct + "%";
      if (label) label.textContent = pct + "% (" + doneAll + "/" + totalAll + ")";
    }
  }
})();
