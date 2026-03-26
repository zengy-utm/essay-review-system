// 平滑滚动
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// 处理表单提交
document.querySelector('.contact-form').addEventListener('submit', function(e) {
    e.preventDefault();
    alert('感谢您的提交！我会尽快与您联系。');
    this.reset();
});

// 页面加载后的初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('个人主页已加载');
});
