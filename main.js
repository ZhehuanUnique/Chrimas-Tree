// 主程序
let video, canvas, statusElement;
let particleTree;
let gestureDetector;
let isGenerating = false;

// 检查权限状态
async function checkPermission() {
    if (navigator.permissions) {
        try {
            const result = await navigator.permissions.query({ name: 'camera' });
            return result.state;
        } catch (e) {
            // Safari 可能不支持 permissions API
            return 'unknown';
        }
    }
    return 'unknown';
}

// 初始化
async function init() {
    video = document.getElementById('video');
    canvas = document.getElementById('canvas');
    statusElement = document.getElementById('status');
    
    // 创建粒子圣诞树
    particleTree = new ParticleTree(canvas);
    particleTree.animate();
    
    // 检查是否支持 getUserMedia
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        updateStatus('您的浏览器不支持摄像头访问');
        return;
    }
    
    // 请求摄像头权限
    try {
        updateStatus('正在请求摄像头权限...');
        
        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: 'user', // 前置摄像头
                width: { ideal: 1280 },
                height: { ideal: 720 }
            }
        });
        
        // 检查流是否真的可用
        if (!stream || !stream.active) {
            throw new Error('摄像头流未激活');
        }
        
        video.srcObject = stream;
        
        // 等待视频元数据加载
        await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('视频加载超时'));
            }, 10000);
            
            const onLoaded = () => {
                clearTimeout(timeout);
                video.play()
                    .then(() => {
                        console.log('视频播放成功');
                        resolve();
                    })
                    .catch((playError) => {
                        console.warn('自动播放失败，但继续处理:', playError);
                        // Safari 可能阻止自动播放，但视频流仍然可用
                        resolve();
                    });
            };
            
            if (video.readyState >= 2) {
                // 视频已加载
                onLoaded();
            } else {
                video.addEventListener('loadedmetadata', onLoaded, { once: true });
                video.addEventListener('loadeddata', onLoaded, { once: true });
            }
            
            video.addEventListener('error', (error) => {
                clearTimeout(timeout);
                reject(error);
            }, { once: true });
        });
        
        // 验证视频流是否真的在工作
        const tracks = stream.getVideoTracks();
        if (tracks.length === 0 || !tracks[0].enabled) {
            throw new Error('摄像头流未激活');
        }
        
        updateStatus('摄像头已启动，请将手放在摄像头前');
        
        // 初始化手势识别
        try {
            // 等待一小段时间确保视频流稳定
            await new Promise(resolve => setTimeout(resolve, 500));
            
            gestureDetector = new HandGestureDetector(video, handleGestureChange);
            await gestureDetector.initialize();
            updateStatus('手势识别已启动！张开5指生成圣诞树，收紧5指清除');
        } catch (gestureError) {
            console.error('手势识别初始化失败:', gestureError);
            let errorMsg = '手势识别初始化失败';
            
            if (gestureError.message) {
                if (gestureError.message.includes('MediaPipe')) {
                    errorMsg = 'MediaPipe 库加载失败，请检查网络连接或刷新页面';
                } else if (gestureError.message.includes('视频')) {
                    errorMsg = '视频流问题，请刷新页面重试';
                } else {
                    errorMsg = gestureError.message;
                }
            }
            
            updateStatus(`摄像头已启动，但${errorMsg}`);
            
            // 提供重试选项
            setTimeout(() => {
                updateStatus('请刷新页面重试，或检查控制台查看详细错误');
            }, 3000);
        }
        
    } catch (error) {
        console.error('无法访问摄像头:', error);
        
        let errorMessage = '无法访问摄像头';
        const isSafari = navigator.userAgent.indexOf('Safari') !== -1 && navigator.userAgent.indexOf('Chrome') === -1;
        
        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
            // 权限被拒绝
            if (isSafari) {
                errorMessage = '摄像头权限被拒绝。请点击地址栏左侧的摄像头图标，选择"允许"，然后刷新页面';
            } else {
                errorMessage = '摄像头权限被拒绝，请在浏览器设置中允许摄像头访问';
            }
        } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
            errorMessage = '未找到摄像头设备';
        } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
            errorMessage = '摄像头被其他应用占用，请关闭其他应用后重试';
        } else if (error.message && error.message.includes('超时')) {
            // 视频加载超时，但可能是权限问题
            if (isSafari) {
                errorMessage = '请确保已允许摄像头权限，然后刷新页面重试';
            } else {
                errorMessage = '视频加载超时，请刷新页面重试';
            }
        } else {
            errorMessage = `无法访问摄像头: ${error.message || error.name}`;
        }
        
        updateStatus(errorMessage);
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

// 等待 MediaPipe 库加载
function waitForMediaPipe() {
    return new Promise((resolve, reject) => {
        // 检查是否已经加载（支持多种加载方式）
        const checkLoaded = () => {
            return window.MediaPipeHands || window.Hands || (typeof Hands !== 'undefined' ? Hands : null);
        };
        
        if (checkLoaded()) {
            console.log('MediaPipe Hands already loaded');
            resolve();
            return;
        }
        
        // 等待加载，增加超时时间
        let attempts = 0;
        const maxAttempts = 150; // 最多等待15秒
        
        const checkInterval = setInterval(() => {
            attempts++;
            if (checkLoaded()) {
                clearInterval(checkInterval);
                console.log('MediaPipe Hands loaded after', attempts * 100, 'ms');
                resolve();
            } else if (attempts >= maxAttempts) {
                clearInterval(checkInterval);
                reject(new Error('MediaPipe Hands 库加载超时，请检查网络连接或刷新页面'));
            }
        }, 100);
    });
}

// 页面加载完成后初始化
window.addEventListener('DOMContentLoaded', async () => {
    // 先获取状态元素
    statusElement = document.getElementById('status');
    
    try {
        // 等待 MediaPipe 库加载
        updateStatus('正在加载 MediaPipe 库...');
        await waitForMediaPipe();
        // 再等待一小段时间确保完全初始化
        await new Promise(resolve => setTimeout(resolve, 500));
        // 初始化应用
        await init();
    } catch (error) {
        console.error('初始化失败:', error);
        if (statusElement) {
            statusElement.textContent = '初始化失败: ' + (error.message || '未知错误') + '，请刷新页面重试';
        }
    }
});

// 处理页面可见性变化
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // 页面隐藏时停止
        if (gestureDetector) {
            gestureDetector.stop();
        }
    }
});

