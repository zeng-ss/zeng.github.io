document.addEventListener('DOMContentLoaded', function () {
    const cards = document.querySelectorAll('.index-card');
    if (!cards.length) return;

    const row = document.querySelector('.row');
    if (row) row.style.overflow = 'hidden';

    const coefficient = window.innerWidth > 768 ? 0.5 : 0.3;
    let origin = window.innerHeight * (1 - coefficient);

    // 正确节流
    function throttle(func, limit) {
        let inThrottle;
        return function () {
            if (!inThrottle) {
                func();
                inThrottle = true;
                setTimeout(() => (inThrottle = false), limit);
            }
        };
    }

    // 核心：强制设置 CSS 变量
    function updateCards() {
        cards.forEach(card => {
            const top = card.getBoundingClientRect().top;
            const show = top < origin ? 1 : 0;

            // 最稳定的赋值方式，不会解析失败
            card.style.setProperty('--state', show);
        });
    }

    // 立即执行 + 滚动执行
    updateCards();
    window.addEventListener('scroll', throttle(updateCards, 100));
    window.addEventListener('resize', throttle(() => {
        origin = window.innerHeight * (1 - coefficient);
        updateCards();
    }, 200));
});