// 手势识别系统
class HandGestureDetector {
    constructor(video, onGestureChange) {
        this.video = video;
        this.onGestureChange = onGestureChange;
        this.hands = null;
        this.camera = null;
        this.lastGesture = null;
        this.gestureThreshold = 0.5; // 手势变化阈值
    }

    async initialize() {
        return new Promise((resolve, reject) => {
            this.hands = new Hands({
                locateFile: (file) => {
                    return `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1675469404/${file}`;
                }
            });

            this.hands.setOptions({
                maxNumHands: 1,
                modelComplexity: 1,
                minDetectionConfidence: 0.5,
                minTrackingConfidence: 0.5
            });

            this.hands.onResults((results) => {
                this.processResults(results);
            });

            this.camera = new Camera(this.video, {
                onFrame: async () => {
                    await this.hands.send({ image: this.video });
                },
                width: 1280,
                height: 720
            });

            this.camera.start()
                .then(() => {
                    console.log('摄像头启动成功');
                    resolve();
                })
                .catch((error) => {
                    console.error('摄像头启动失败:', error);
                    reject(error);
                });
        });
    }

    // 计算两点之间的距离
    distance(point1, point2) {
        const dx = point1.x - point2.x;
        const dy = point1.y - point2.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    // 检测手指是否张开
    isFingerExtended(landmarks, fingerTips, fingerPips) {
        const tip = landmarks[fingerTips];
        const pip = landmarks[fingerPips];
        const mcp = landmarks[fingerPips - 2];
        
        // 计算指尖到指根的距离
        const tipToPip = this.distance(tip, pip);
        const pipToMcp = this.distance(pip, mcp);
        
        // 如果指尖到PIP的距离大于PIP到MCP的距离，则认为手指张开
        return tipToPip > pipToMcp * 0.8;
    }

    // 检测手势
    detectGesture(landmarks) {
        // 手指关键点索引（MediaPipe Hands）
        const fingerTips = [4, 8, 12, 16, 20]; // 拇指、食指、中指、无名指、小指
        const fingerPips = [3, 6, 10, 14, 18];
        
        let extendedCount = 0;
        
        // 检查每个手指
        for (let i = 0; i < 5; i++) {
            if (i === 0) {
                // 拇指特殊处理（横向比较）
                const thumbTip = landmarks[4];
                const thumbIp = landmarks[3];
                const thumbMcp = landmarks[2];
                
                // 拇指需要根据手的方向来判断
                const handDirection = landmarks[5].x - landmarks[17].x;
                const thumbExtended = handDirection > 0 
                    ? thumbTip.x > thumbIp.x 
                    : thumbTip.x < thumbIp.x;
                
                if (thumbExtended) extendedCount++;
            } else {
                if (this.isFingerExtended(landmarks, fingerTips[i], fingerPips[i])) {
                    extendedCount++;
                }
            }
        }
        
        // 判断手势
        if (extendedCount >= 4) {
            return 'open'; // 5指张开（允许1个手指不完全张开）
        } else if (extendedCount <= 1) {
            return 'closed'; // 5指收紧
        }
        
        return 'unknown';
    }

    // 处理识别结果
    processResults(results) {
        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            const landmarks = results.multiHandLandmarks[0];
            const gesture = this.detectGesture(landmarks);
            
            // 只有当手势发生变化时才触发回调
            if (gesture !== this.lastGesture && gesture !== 'unknown') {
                this.lastGesture = gesture;
                this.onGestureChange(gesture);
            }
        } else {
            // 没有检测到手
            if (this.lastGesture !== null) {
                this.lastGesture = null;
            }
        }
    }

    // 停止检测
    stop() {
        if (this.camera) {
            this.camera.stop();
        }
    }
}

