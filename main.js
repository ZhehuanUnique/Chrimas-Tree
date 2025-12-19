// 主程序
let video, canvas, statusElement;
let particleTree;
let gestureDetector;
let isGenerating = false;

// 初始化
async function init() {
    video = document.getElementById('video');
    canvas = document.getElementById('canvas');
    statusElement = document.getElementById('status');
    
    // 创建粒子圣诞树
    particleTree = new ParticleTree(canvas);
    particleTree.animate();
    
    // 请求摄像头权限
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: 'user', // 前置摄像头
                width: { ideal: 1280 },
                height: { ideal: 720 }
            }
        });
        
        video.srcObject = stream;
        updateStatus('摄像头已启动，请将手放在摄像头前');
        
        // 初始化手势识别
        gestureDetector = new HandGestureDetector(video, handleGestureChange);
        await gestureDetector.initialize();
        
        updateStatus('手势识别已启动！张开5指生成圣诞树，收紧5指清除');
        
    } catch (error) {
        console.error('无法访问摄像头:', error);
        updateStatus('无法访问摄像头，请检查权限设置');
    }
}

// 更新状态显示
function updateStatus(message) {
    statusElement.textContent = message;
    
    // 添加闪烁效果
    statusElement.classList.add('gesture-detected');
    setTimeout(() => {
        statusElement.classList.remove('gesture-detected');
    }, 500);
}

// 处理手势变化
function handleGestureChange(gesture) {
    if (gesture === 'open' && !isGenerating) {
        // 张开5指 - 生成圣诞树
        isGenerating = true;
        particleTree.generateTree();
        updateStatus('🎄 正在生成圣诞树...');
        
        setTimeout(() => {
            isGenerating = false;
        }, 1000);
        
    } else if (gesture === 'closed' && isGenerating) {
        // 收紧5指 - 清除圣诞树
        isGenerating = false;
        particleTree.clear();
        updateStatus('✨ 正在清除粒子...');
    }
}

// 页面加载完成后初始化
window.addEventListener('DOMContentLoaded', init);

// 处理页面可见性变化
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // 页面隐藏时停止
        if (gestureDetector) {
            gestureDetector.stop();
        }
    }
});

