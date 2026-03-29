document.addEventListener('DOMContentLoaded', function () {
    const cards = document.querySelectorAll('.index-card');
    if (!cards.length) return;

    const row = document.querySelector('.row');
    if (row) row.style.overflow = 'hidden';

    // 节流函数
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

    // ✅ 关键：卡片【完全进入屏幕】再显示
    function updateCards() {
        cards.forEach(card => {
            const rect = card.getBoundingClientRect();
            const viewHeight = window.innerHeight;
            // 卡片进入屏幕 80% 就开始放大
            const isAlmostIn = rect.top < viewHeight * 0.8 && rect.bottom > 0;
            card.style.setProperty('--state', isAlmostIn ? 1 : 0);
        });
    }

    updateCards();
    window.addEventListener('scroll', throttle(updateCards, 80));
    window.addEventListener('resize', throttle(updateCards, 200));
});