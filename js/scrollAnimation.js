document.addEventListener('DOMContentLoaded', function () {
    const cards = document.querySelectorAll('.index-card');
    if (!cards.length) return;

    const row = document.querySelector('.row');
    if (row) row.style.overflow = 'hidden';

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

    // ✅ 正确：卡片进入屏幕 80% 高度就触发动画（你要的效果）
    function updateCards() {
        cards.forEach(card => {
            const rect = card.getBoundingClientRect();
            const viewHeight = window.innerHeight;
            // 核心：卡片顶部进入屏幕，且露出 >= 80% 自身高度
            const show = rect.top < viewHeight && rect.bottom > rect.height * 0.2;
            card.style.setProperty('--state', show ? 1 : 0);
        });
    }

    updateCards();
    window.addEventListener('scroll', throttle(updateCards, 50));
    window.addEventListener('resize', throttle(updateCards, 200));
});