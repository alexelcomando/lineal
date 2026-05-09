/**
 * VERSIÓN FINAL CORREGIDA - Transformaciones funcionando con proporción
 * Editor Inteligente de Imágenes - Álgebra Lineal
 */

console.log('Cargando editor final corregido...');

// ==========================================
// VARIABLES GLOBALES
// ==========================================
let originalImageData = null;
let currentImageData = null;
let originalCanvas = null;
let transformedCanvas = null;

// Espacio fijo para imágenes
const CANVAS_SPACE = {
    width: 500,
    height: 400
};

// Información de la imagen original
let originalImageInfo = {
    width: 0,
    height: 0,
    scale: 1,
    offsetX: 0,
    offsetY: 0
};

// ==========================================
// FUNCIONES DE CÁLCULO DE PROPORCIÓN
// ==========================================
function calculateAspectRatioFit(imageWidth, imageHeight, containerWidth, containerHeight) {
    const scaleX = containerWidth / imageWidth;
    const scaleY = containerHeight / imageHeight;
    const scale = Math.min(scaleX, scaleY, 1);
    
    const scaledWidth = imageWidth * scale;
    const scaledHeight = imageHeight * scale;
    
    const offsetX = (containerWidth - scaledWidth) / 2;
    const offsetY = (containerHeight - scaledHeight) / 2;
    
    return {
        width: scaledWidth,
        height: scaledHeight,
        scale: scale,
        offsetX: offsetX,
        offsetY: offsetY
    };
}

function setupCanvasSpace(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
        console.error(`Canvas ${canvasId} no encontrado`);
        return false;
    }
    
    canvas.width = CANVAS_SPACE.width;
    canvas.height = CANVAS_SPACE.height;
    
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, CANVAS_SPACE.width, CANVAS_SPACE.height);
    
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, CANVAS_SPACE.width, CANVAS_SPACE.height);
    
    return true;
}

function drawImageInSpace(imageData, canvasId, clearFirst = true) {
    const canvas = document.getElementById(canvasId);
    if (!canvas || !imageData) {
        console.error('Canvas o imagen no disponibles');
        return false;
    }
    
    const ctx = canvas.getContext('2d');
    
    if (clearFirst) {
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(0, 0, CANVAS_SPACE.width, CANVAS_SPACE.height);
        ctx.strokeStyle = '#ddd';
        ctx.lineWidth = 2;
        ctx.strokeRect(0, 0, CANVAS_SPACE.width, CANVAS_SPACE.height);
    }
    
    const fit = calculateAspectRatioFit(
        imageData.width, 
        imageData.height, 
        CANVAS_SPACE.width, 
        CANVAS_SPACE.height
    );
    
    if (canvasId === 'originalCanvas') {
        originalImageInfo = {
            width: imageData.width,
            height: imageData.height,
            scale: fit.scale,
            offsetX: fit.offsetX,
            offsetY: fit.offsetY
        };
    }
    
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = imageData.width;
    tempCanvas.height = imageData.height;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.putImageData(imageData, 0, 0);
    
    ctx.save();
    ctx.drawImage(
        tempCanvas, 
        fit.offsetX, 
        fit.offsetY, 
        fit.width, 
        fit.height
    );
    ctx.restore();
    
    return true;
}

function showImageInfo() {
    const infoDiv = document.getElementById('imageInfo') || createImageInfoDiv();
    
    if (originalImageData) {
        infoDiv.innerHTML = `
            <strong>Info Imagen:</strong><br>
            Original: ${originalImageData.width}x${originalImageData.height}px<br>
            Espacio: ${CANVAS_SPACE.width}x${CANVAS_SPACE.height}px<br>
            Escala: ${(originalImageInfo.scale * 100).toFixed(1)}%<br>
            Mostrando: ${Math.round(originalImageData.width * originalImageInfo.scale)}x${Math.round(originalImageData.height * originalImageInfo.scale)}px
        `;
        infoDiv.style.display = 'block';
    }
}

function createImageInfoDiv() {
    const infoDiv = document.createElement('div');
    infoDiv.id = 'imageInfo';
    infoDiv.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 10px;
        border-radius: 5px;
        font-size: 12px;
        z-index: 1000;
        max-width: 200px;
    `;
    
    document.body.appendChild(infoDiv);
    return infoDiv;
}

// ==========================================
// FUNCIONES BÁSICAS DE CANVAS
// ==========================================
function getCanvasContext(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
        console.error(`Canvas ${canvasId} no encontrado`);
        return null;
    }
    return canvas.getContext('2d');
}

function createSampleImage(width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    
    const gradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, Math.max(width, height)/2);
    gradient.addColorStop(0, '#FF6B6B');
    gradient.addColorStop(0.3, '#4ECDC4');
    gradient.addColorStop(0.6, '#45B7D1');
    gradient.addColorStop(1, '#96CEB4');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    for (let i = 0; i < 5; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const radius = Math.random() * 30 + 10;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
    }
    
    return ctx.getImageData(0, 0, width, height);
}

// ==========================================
// FUNCIONES DE TRANSFORMACIÓN CORREGIDAS
// ==========================================
function rotateImage(imageData, angle) {
    const canvas = document.createElement('canvas');
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    const ctx = canvas.getContext('2d');
    
    ctx.putImageData(imageData, 0, 0);
    
    const resultCanvas = document.createElement('canvas');
    resultCanvas.width = imageData.width;
    resultCanvas.height = imageData.height;
    const resultCtx = resultCanvas.getContext('2d');
    
    resultCtx.save();
    resultCtx.translate(imageData.width / 2, imageData.height / 2);
    resultCtx.rotate(angle * Math.PI / 180);
    resultCtx.drawImage(canvas, -imageData.width / 2, -imageData.height / 2);
    resultCtx.restore();
    
    return resultCtx.getImageData(0, 0, imageData.width, imageData.height);
}

function scaleImage(imageData, scaleX, scaleY) {
    const canvas = document.createElement('canvas');
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    const ctx = canvas.getContext('2d');
    
    ctx.putImageData(imageData, 0, 0);
    
    const resultCanvas = document.createElement('canvas');
    resultCanvas.width = imageData.width;
    resultCanvas.height = imageData.height;
    const resultCtx = resultCanvas.getContext('2d');
    
    resultCtx.save();
    resultCtx.translate(imageData.width / 2, imageData.height / 2);
    resultCtx.scale(scaleX, scaleY);
    resultCtx.drawImage(canvas, -imageData.width / 2, -imageData.height / 2);
    resultCtx.restore();
    
    return resultCtx.getImageData(0, 0, imageData.width, imageData.height);
}

function translateImage(imageData, translateX, translateY) {
    const canvas = document.createElement('canvas');
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    const ctx = canvas.getContext('2d');
    
    ctx.putImageData(imageData, 0, 0);
    
    const resultCanvas = document.createElement('canvas');
    resultCanvas.width = imageData.width;
    resultCanvas.height = imageData.height;
    const resultCtx = resultCanvas.getContext('2d');
    
    resultCtx.save();
    resultCtx.translate(translateX, translateY);
    resultCtx.drawImage(canvas, 0, 0);
    resultCtx.restore();
    
    return resultCtx.getImageData(0, 0, imageData.width, imageData.height);
}

function reflectImageHorizontal(imageData) {
    const canvas = document.createElement('canvas');
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    const ctx = canvas.getContext('2d');
    
    ctx.putImageData(imageData, 0, 0);
    
    const resultCanvas = document.createElement('canvas');
    resultCanvas.width = imageData.width;
    resultCanvas.height = imageData.height;
    const resultCtx = resultCanvas.getContext('2d');
    
    resultCtx.save();
    resultCtx.scale(-1, 1);
    resultCtx.drawImage(canvas, -imageData.width, 0);
    resultCtx.restore();
    
    return resultCtx.getImageData(0, 0, imageData.width, imageData.height);
}

function reflectImageVertical(imageData) {
    const canvas = document.createElement('canvas');
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    const ctx = canvas.getContext('2d');
    
    ctx.putImageData(imageData, 0, 0);
    
    const resultCanvas = document.createElement('canvas');
    resultCanvas.width = imageData.width;
    resultCanvas.height = imageData.height;
    const resultCtx = resultCanvas.getContext('2d');
    
    resultCtx.save();
    resultCtx.scale(1, -1);
    resultCtx.drawImage(canvas, 0, -imageData.height);
    resultCtx.restore();
    
    return resultCtx.getImageData(0, 0, imageData.width, imageData.height);
}

// ==========================================
// FILTROS SIMPLES
// ==========================================
function applyBlur(imageData, intensity = 5) {
    const canvas = document.createElement('canvas');
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    const ctx = canvas.getContext('2d');
    
    ctx.putImageData(imageData, 0, 0);
    
    ctx.filter = `blur(${intensity}px)`;
    ctx.drawImage(canvas, 0, 0);
    
    return ctx.getImageData(0, 0, imageData.width, imageData.height);
}

function applyGrayscale(imageData) {
    const canvas = document.createElement('canvas');
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    const ctx = canvas.getContext('2d');
    
    ctx.putImageData(imageData, 0, 0);
    
    ctx.filter = 'grayscale(100%)';
    ctx.drawImage(canvas, 0, 0);
    
    return ctx.getImageData(0, 0, imageData.width, imageData.height);
}

function applySharpen(imageData) {
    const canvas = document.createElement('canvas');
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    const ctx = canvas.getContext('2d');
    
    ctx.putImageData(imageData, 0, 0);
    
    ctx.filter = 'contrast(150%) brightness(110%)';
    ctx.drawImage(canvas, 0, 0);
    
    return ctx.getImageData(0, 0, imageData.width, imageData.height);
}

function applyEdgeDetection(imageData) {
    const canvas = document.createElement('canvas');
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    const ctx = canvas.getContext('2d');
    
    ctx.putImageData(imageData, 0, 0);
    
    ctx.filter = 'grayscale(100%)';
    ctx.drawImage(canvas, 0, 0);
    
    ctx.filter = 'contrast(500%) brightness(50%)';
    ctx.drawImage(canvas, 0, 0);
    
    return ctx.getImageData(0, 0, imageData.width, imageData.height);
}

function applyEmboss(imageData) {
    const canvas = document.createElement('canvas');
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    const ctx = canvas.getContext('2d');
    
    ctx.putImageData(imageData, 0, 0);
    
    ctx.filter = 'contrast(120%) brightness(90%) sepia(30%)';
    ctx.drawImage(canvas, 0, 0);
    
    return ctx.getImageData(0, 0, imageData.width, imageData.height);
}

// ==========================================
// FUNCIONES DE MANEJO DE ARCHIVOS
// ==========================================
function saveImage(canvasId, filename) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
        console.error(`Canvas ${canvasId} no encontrado`);
        return false;
    }
    
    try {
        const link = document.createElement('a');
        link.download = filename + '.png';
        link.href = canvas.toDataURL('image/png');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return true;
    } catch (error) {
        console.error('Error al guardar imagen:', error);
        return false;
    }
}

async function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return false;
    
    try {
        showMessage('Cargando imagen...', 'info');
        
        const imageData = await loadImageFromFile(file);
        originalImageData = imageData;
        currentImageData = imageData;
        
        setupCanvasSpace('originalCanvas');
        setupCanvasSpace('transformedCanvas');
        
        const success1 = drawImageInSpace(imageData, 'originalCanvas');
        const success2 = drawImageInSpace(imageData, 'transformedCanvas');
        
        showImageInfo();
        
        if (success1 && success2) {
            showMessage(`Imagen cargada (${imageData.width}x${imageData.height}px)`, 'success');
            return true;
        } else {
            showMessage('Error al mostrar imagen', 'error');
            return false;
        }
    } catch (error) {
        console.error('Error al cargar imagen:', error);
        showMessage('Error al cargar imagen: ' + error.message, 'error');
        return false;
    }
}

function loadImageFromFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                
                ctx.drawImage(img, 0, 0);
                const imageData = ctx.getImageData(0, 0, img.width, img.height);
                resolve(imageData);
            };
            img.onerror = () => reject(new Error('Error al cargar la imagen'));
            img.src = event.target.result;
        };
        
        reader.onerror = () => reject(new Error('Error al leer el archivo'));
        reader.readAsDataURL(file);
    });
}

// ==========================================
// FUNCIONES DE UI
// ==========================================
function showMessage(message, type = 'info') {
    const messageDiv = document.getElementById('statusMessage');
    if (!messageDiv) return;
    
    messageDiv.className = type;
    messageDiv.textContent = message;
    
    setTimeout(() => {
        messageDiv.textContent = '';
        messageDiv.className = '';
    }, 3000);
}

function updateSliderValue(sliderId, value) {
    const displayElement = document.getElementById(sliderId + 'Value');
    if (!displayElement) return;
    
    let formattedValue = value;
    if (sliderId === 'rotation') {
        formattedValue = value + '°';
    } else if (sliderId.includes('scale')) {
        formattedValue = parseFloat(value).toFixed(1);
    }
    
    displayElement.textContent = formattedValue;
}

function updateTransformedImage() {
    if (!currentImageData) return;
    
    const success = drawImageInSpace(currentImageData, 'transformedCanvas');
    if (success) {
        showMessage('Imagen actualizada', 'success');
    } else {
        showMessage('Error al actualizar imagen', 'error');
    }
}

// ==========================================
// FUNCIONES PRINCIPALES CORREGIDAS
// ==========================================
function loadSampleImage() {
    try {
        console.log('Cargando imagen de ejemplo...');
        
        const sampleWidth = 800;
        const sampleHeight = 600;
        const sampleImageData = createSampleImage(sampleWidth, sampleHeight);
        
        originalImageData = sampleImageData;
        currentImageData = sampleImageData;
        
        setupCanvasSpace('originalCanvas');
        setupCanvasSpace('transformedCanvas');
        
        const success1 = drawImageInSpace(sampleImageData, 'originalCanvas');
        const success2 = drawImageInSpace(sampleImageData, 'transformedCanvas');
        
        showImageInfo();
        
        if (success1 && success2) {
            showMessage(`Imagen de ejemplo cargada (${sampleWidth}x${sampleHeight}px)`, 'success');
        } else {
            showMessage('Error al mostrar imagen', 'error');
        }
    } catch (error) {
        console.error('Error al cargar imagen de ejemplo:', error);
        showMessage('Error al cargar imagen de ejemplo', 'error');
    }
}

function applyGeometricTransform() {
    if (!originalImageData) {
        showMessage('No hay imagen cargada', 'error');
        return;
    }
    
    try {
        const rotation = parseFloat(document.getElementById('rotationSlider').value);
        const scaleX = parseFloat(document.getElementById('scaleXSlider').value);
        const scaleY = parseFloat(document.getElementById('scaleYSlider').value);
        const translateX = parseFloat(document.getElementById('translateXSlider').value);
        const translateY = parseFloat(document.getElementById('translateYSlider').value);
        
        console.log('Aplicando transformación:', { rotation, scaleX, scaleY, translateX, translateY });
        
        let result = originalImageData;
        
        // Aplicar transformaciones en orden
        if (rotation !== 0) {
            console.log('Aplicando rotación:', rotation, 'grados');
            result = rotateImage(result, rotation);
        }
        
        if (scaleX !== 1 || scaleY !== 1) {
            console.log('Aplicando escalado:', scaleX, scaleY);
            result = scaleImage(result, scaleX, scaleY);
        }
        
        if (translateX !== 0 || translateY !== 0) {
            console.log('Aplicando traslación:', translateX, translateY);
            result = translateImage(result, translateX, translateY);
        }
        
        currentImageData = result;
        updateTransformedImage();
        
        showMessage('Transformación aplicada', 'success');
        
    } catch (error) {
        console.error('Error en transformación:', error);
        showMessage('Error al aplicar transformación: ' + error.message, 'error');
    }
}

function reflectHorizontal() {
    if (!originalImageData) {
        showMessage('No hay imagen cargada', 'error');
        return;
    }
    
    try {
        console.log('Aplicando reflexión horizontal');
        const result = reflectImageHorizontal(originalImageData);
        currentImageData = result;
        updateTransformedImage();
        showMessage('Reflexión horizontal aplicada', 'success');
    } catch (error) {
        console.error('Error en reflexión:', error);
        showMessage('Error al aplicar reflexión: ' + error.message, 'error');
    }
}

function reflectVertical() {
    if (!originalImageData) {
        showMessage('No hay imagen cargada', 'error');
        return;
    }
    
    try {
        console.log('Aplicando reflexión vertical');
        const result = reflectImageVertical(originalImageData);
        currentImageData = result;
        updateTransformedImage();
        showMessage('Reflexión vertical aplicada', 'success');
    } catch (error) {
        console.error('Error en reflexión:', error);
        showMessage('Error al aplicar reflexión: ' + error.message, 'error');
    }
}

function resetTransform() {
    if (!originalImageData) {
        showMessage('No hay imagen original', 'error');
        return;
    }
    
    try {
        console.log('Reiniciando transformaciones');
        currentImageData = originalImageData;
        updateTransformedImage();
        
        document.getElementById('rotationSlider').value = 0;
        document.getElementById('scaleXSlider').value = 1;
        document.getElementById('scaleYSlider').value = 1;
        document.getElementById('translateXSlider').value = 0;
        document.getElementById('translateYSlider').value = 0;
        
        updateSliderValue('rotation', 0);
        updateSliderValue('scaleX', 1);
        updateSliderValue('scaleY', 1);
        updateSliderValue('translateX', 0);
        updateSliderValue('translateY', 0);
        
        showMessage('Transformaciones reiniciadas', 'success');
    } catch (error) {
        console.error('Error al reiniciar:', error);
        showMessage('Error al reiniciar: ' + error.message, 'error');
    }
}

function applyFilter(filterType) {
    if (!currentImageData) {
        showMessage('No hay imagen cargada', 'error');
        return;
    }
    
    try {
        console.log('Aplicando filtro:', filterType);
        
        let result;
        switch (filterType) {
            case 'blur':
                console.log('Aplicando blur con intensidad 3');
                result = applyBlur(currentImageData, 3);
                break;
            case 'sharpen':
                console.log('Aplicando sharpen');
                result = applySharpen(currentImageData);
                break;
            case 'edge':
                console.log('Aplicando edge detection');
                result = applyEdgeDetection(currentImageData);
                break;
            case 'emboss':
                console.log('Aplicando emboss');
                result = applyEmboss(currentImageData);
                break;
            case 'grayscale':
                console.log('Aplicando grayscale');
                result = applyGrayscale(currentImageData);
                break;
            default:
                showMessage('Filtro no reconocido', 'error');
                return;
        }
        
        currentImageData = result;
        updateTransformedImage();
        showMessage(`Filtro ${filterType} aplicado`, 'success');
        
    } catch (error) {
        console.error('Error en filtro:', error);
        showMessage('Error al aplicar filtro: ' + error.message, 'error');
    }
}

function showMatrixView() {
    if (!currentImageData) {
        showMessage('No hay imagen cargada', 'error');
        return;
    }
    
    try {
        const matrixCanvas = document.createElement('canvas');
        
        const maxSize = 300;
        const scale = Math.min(maxSize / currentImageData.width, maxSize / currentImageData.height, 1);
        
        matrixCanvas.width = Math.round(currentImageData.width * scale);
        matrixCanvas.height = Math.round(currentImageData.height * scale);
        
        const ctx = matrixCanvas.getContext('2d');
        
        const cellSize = Math.max(1, Math.floor(300 / Math.max(currentImageData.width, currentImageData.height)));
        
        for (let y = 0; y < matrixCanvas.height; y++) {
            for (let x = 0; x < matrixCanvas.width; x++) {
                const originalX = Math.floor(x / scale);
                const originalY = Math.floor(y / scale);
                
                if (originalX < currentImageData.width && originalY < currentImageData.height) {
                    const index = (originalY * currentImageData.width + originalX) * 4;
                    const gray = Math.round(0.299 * currentImageData.data[index] + 
                                       0.587 * currentImageData.data[index + 1] + 
                                       0.114 * currentImageData.data[index + 2]);
                    
                    ctx.fillStyle = `rgb(${gray}, ${gray}, ${gray})`;
                    ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
                }
            }
        }
        
        const dialog = document.createElement('div');
        dialog.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            z-index: 1000;
            text-align: center;
            max-width: 90%;
            max-height: 90vh;
            overflow: auto;
        `;
        
        dialog.innerHTML = `
            <h3>Matriz de Píxeles</h3>
            <p>Tamaño original: ${currentImageData.width}x${currentImageData.height}px</p>
            <p>Escala: ${(scale * 100).toFixed(1)}%</p>
            <div style="margin: 10px 0; border: 1px solid #ddd; display: inline-block;"></div>
            <button onclick="this.parentElement.remove()" style="
                background: #3498db;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 5px;
                cursor: pointer;
            ">Cerrar</button>
        `;
        
        dialog.querySelector('div').appendChild(matrixCanvas);
        document.body.appendChild(dialog);
        
        showMessage('Vista de matriz generada', 'success');
        
    } catch (error) {
        console.error('Error al mostrar matriz:', error);
        showMessage('Error al mostrar matriz: ' + error.message, 'error');
    }
}

function showTransformationMatrix() {
    const rotation = parseFloat(document.getElementById('rotationSlider').value);
    const scaleX = parseFloat(document.getElementById('scaleXSlider').value);
    const scaleY = parseFloat(document.getElementById('scaleYSlider').value);
    const translateX = parseFloat(document.getElementById('translateXSlider').value);
    const translateY = parseFloat(document.getElementById('translateYSlider').value);
    
    const matrixContent = `
        <h4>Parámetros de Transformación</h4>
        <p><strong>Rotación:</strong> ${rotation}°</p>
        <p><strong>Escala X:</strong> ${scaleX}</p>
        <p><strong>Escala Y:</strong> ${scaleY}</p>
        <p><strong>Traslación X:</strong> ${translateX}px</p>
        <p><strong>Traslación Y:</strong> ${translateY}px</p>
        
        <h4>Matriz de Rotación:</h4>
        <pre style="background: #f0f0f0; padding: 10px; border-radius: 5px; font-size: 12px;">
[cos(${rotation}°)  -sin(${rotation}°)]
[sin(${rotation}°)   cos(${rotation}°)]
        </pre>
        
        <h4>Matriz de Escalado:</h4>
        <pre style="background: #f0f0f0; padding: 10px; border-radius: 5px; font-size: 12px;">
[${scaleX}  0]
[0  ${scaleY}]
        </pre>
        
        <h4>Matriz de Traslación:</h4>
        <pre style="background: #f0f0f0; padding: 10px; border-radius: 5px; font-size: 12px;">
[1  0 ${translateX}]
[0  1 ${translateY}]
[0  0   1]
        </pre>
    `;
    
    const dialog = document.createElement('div');
    dialog.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 20px;
        border-radius: 10px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        z-index: 1000;
        max-width: 500px;
        max-height: 80vh;
        overflow-y: auto;
    `;
    
    dialog.innerHTML = `
        ${matrixContent}
        <button onclick="this.parentElement.remove()" style="
            background: #3498db;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            margin-top: 10px;
        ">Cerrar</button>
    `;
    
    document.body.appendChild(dialog);
    showMessage('Matriz de transformación mostrada', 'success');
}

function compareImages() {
    if (!originalImageData || !currentImageData) {
        showMessage('Se necesitan ambas imágenes para comparar', 'error');
        return;
    }
    
    try {
        let totalDifference = 0;
        let pixelCount = 0;
        
        const minCount = Math.min(originalImageData.data.length, currentImageData.data.length);
        
        for (let i = 0; i < minCount; i += 4) {
            const diff = Math.abs(originalImageData.data[i] - currentImageData.data[i]) +
                          Math.abs(originalImageData.data[i + 1] - currentImageData.data[i + 1]) +
                          Math.abs(originalImageData.data[i + 2] - currentImageData.data[i + 2]);
            totalDifference += diff;
            pixelCount++;
        }
        
        const avgDifference = totalDifference / pixelCount;
        const similarity = Math.max(0, 100 - (avgDifference / 255 * 100));
        
        const comparisonResult = `
            <h4>Resultados de Comparación</h4>
            <p><strong>Diferencia promedio:</strong> ${avgDifference.toFixed(2)}</p>
            <p><strong>Similitud:</strong> ${similarity.toFixed(1)}%</p>
            <p><strong>Píxeles comparados:</strong> ${pixelCount}</p>
            <p><strong>Tamaño imagen:</strong> ${originalImageData.width}x${originalImageData.height}px</p>
        `;
        
        const dialog = document.createElement('div');
        dialog.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            z-index: 1000;
            max-width: 400px;
        `;
        
        dialog.innerHTML = `
            ${comparisonResult}
            <button onclick="this.parentElement.remove()" style="
                background: #3498db;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 5px;
                cursor: pointer;
                margin-top: 10px;
            ">Cerrar</button>
        `;
        
        document.body.appendChild(dialog);
        showMessage('Comparación completada', 'success');
        
    } catch (error) {
        console.error('Error en comparación:', error);
        showMessage('Error al comparar imágenes: ' + error.message, 'error');
    }
}

function saveImage() {
    const success = saveImage('transformedCanvas', 'imagen_transformada');
    
    if (success) {
        showMessage('Imagen guardada exitosamente', 'success');
    } else {
        showMessage('Error al guardar imagen', 'error');
    }
}

// ==========================================
// INICIALIZACIÓN
// ==========================================
function initializeEventListeners() {
    console.log('Inicializando event listeners...');
    
    const imageInput = document.getElementById('imageInput');
    if (imageInput) {
        imageInput.addEventListener('change', handleFileUpload);
    }
    
    const sliders = [
        'rotationSlider',
        'scaleXSlider',
        'scaleYSlider',
        'translateXSlider',
        'translateYSlider'
    ];
    
    sliders.forEach(sliderId => {
        const slider = document.getElementById(sliderId);
        if (slider) {
            slider.addEventListener('input', (e) => {
                updateSliderValue(sliderId.replace('Slider', ''), e.target.value);
            });
        }
    });
    
    const transformButtons = [
        { id: 'applyGeometricTransform', handler: applyGeometricTransform },
        { id: 'reflectHorizontal', handler: reflectHorizontal },
        { id: 'reflectVertical', handler: reflectVertical },
        { id: 'resetTransform', handler: resetTransform }
    ];
    
    transformButtons.forEach(btn => {
        const element = document.getElementById(btn.id);
        if (element) {
            element.addEventListener('click', btn.handler);
        }
    });
    
    document.querySelectorAll('.btn').forEach(btn => {
        const text = btn.textContent.toLowerCase();
        if (text.includes('blur') || text.includes('sharpen') || 
            text.includes('edge') || text.includes('emboss') || 
            text.includes('grayscale')) {
            btn.addEventListener('click', () => applyFilter(text));
        }
    });
    
    const analysisButtons = [
        { id: 'showMatrixView', handler: showMatrixView },
        { id: 'showTransformationMatrix', handler: showTransformationMatrix },
        { id: 'compareImages', handler: compareImages },
        { id: 'saveImage', handler: saveImage }
    ];
    
    analysisButtons.forEach(btn => {
        const element = document.getElementById(btn.id);
        if (element) {
            element.addEventListener('click', btn.handler);
        }
    });
    
    console.log('Event listeners inicializados');
}

function startApp() {
    console.log('Iniciando aplicación final corregida...');
    
    const requiredElements = [
        'originalCanvas',
        'transformedCanvas',
        'statusMessage'
    ];
    
    const missingElements = requiredElements.filter(id => !document.getElementById(id));
    
    if (missingElements.length > 0) {
        console.error('Elementos faltantes:', missingElements);
        showMessage('Error: Faltan elementos necesarios', 'error');
        return;
    }
    
    initializeEventListeners();
    loadSampleImage();
    
    console.log('Aplicación final corregida iniciada');
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startApp);
} else {
    startApp();
}

window.loadSampleImage = loadSampleImage;
window.applyGeometricTransform = applyGeometricTransform;
window.reflectHorizontal = reflectHorizontal;
window.reflectVertical = reflectVertical;
window.resetTransform = resetTransform;
window.applyFilter = applyFilter;
window.showMatrixView = showMatrixView;
window.showTransformationMatrix = showTransformationMatrix;
window.compareImages = compareImages;
window.saveImage = saveImage;

console.log('Script final corregido cargado');
