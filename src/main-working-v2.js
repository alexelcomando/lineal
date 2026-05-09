/**
 * VERSIÓN MINIMALISTA QUE FUNCIONA
 * Editor Inteligente de Imágenes - Álgebra Lineal
 */

console.log('Cargando editor de imágenes...');

// ==========================================
// VARIABLES GLOBALES
// ==========================================
let originalImageData = null;
let currentImageData = null;
let originalCanvas = null;
let transformedCanvas = null;

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
    
    // Crear gradiente simple
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#FF6B6B');
    gradient.addColorStop(0.5, '#4ECDC4');
    gradient.addColorStop(1, '#45B7D1');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    return ctx.getImageData(0, 0, width, height);
}

function drawImageDataToCanvas(imageData, canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
        console.error(`Canvas ${canvasId} no encontrado`);
        return false;
    }
    
    const ctx = canvas.getContext('2d');
    ctx.putImageData(imageData, 0, 0);
    return true;
}

// ==========================================
// FUNCIONES DE TRANSFORMACIÓN SIMPLES
// ==========================================
function rotateImage(imageData, angle) {
    const canvas = document.createElement('canvas');
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    const ctx = canvas.getContext('2d');
    
    // Guardar imagen original
    ctx.putImageData(imageData, 0, 0);
    
    // Crear canvas para resultado
    const resultCanvas = document.createElement('canvas');
    resultCanvas.width = imageData.width;
    resultCanvas.height = imageData.height;
    const resultCtx = resultCanvas.getContext('2d');
    
    // Aplicar rotación
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
    
    // Guardar imagen original
    ctx.putImageData(imageData, 0, 0);
    
    // Crear canvas para resultado
    const resultCanvas = document.createElement('canvas');
    resultCanvas.width = imageData.width;
    resultCanvas.height = imageData.height;
    const resultCtx = resultCanvas.getContext('2d');
    
    // Aplicar escalado
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
    
    // Guardar imagen original
    ctx.putImageData(imageData, 0, 0);
    
    // Crear canvas para resultado
    const resultCanvas = document.createElement('canvas');
    resultCanvas.width = imageData.width;
    resultCanvas.height = imageData.height;
    const resultCtx = resultCanvas.getContext('2d');
    
    // Aplicar traslación
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
    
    // Guardar imagen original
    ctx.putImageData(imageData, 0, 0);
    
    // Crear canvas para resultado
    const resultCanvas = document.createElement('canvas');
    resultCanvas.width = imageData.width;
    resultCanvas.height = imageData.height;
    const resultCtx = resultCanvas.getContext('2d');
    
    // Aplicar reflexión horizontal
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
    
    // Guardar imagen original
    ctx.putImageData(imageData, 0, 0);
    
    // Crear canvas para resultado
    const resultCanvas = document.createElement('canvas');
    resultCanvas.width = imageData.width;
    resultCanvas.height = imageData.height;
    const resultCtx = resultCanvas.getContext('2d');
    
    // Aplicar reflexión vertical
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
    
    // Aplicar filtro CSS blur
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
    
    // Aplicar filtro CSS grayscale
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
    
    // Aplicar filtro CSS contrast para simular sharpen
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
    
    // Convertir a escala de grises primero
    ctx.filter = 'grayscale(100%)';
    ctx.drawImage(canvas, 0, 0);
    
    // Aplicar filtro de contraste alto
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
    
    // Simular efecto emboss con filtros CSS
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
        const imageData = await loadImageFromFile(file);
        originalImageData = imageData;
        currentImageData = imageData;
        
        drawImageDataToCanvas(imageData, 'originalCanvas');
        drawImageDataToCanvas(imageData, 'transformedCanvas');
        
        return true;
    } catch (error) {
        console.error('Error al cargar imagen:', error);
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
            img.onerror = reject;
            img.src = event.target.result;
        };
        
        reader.onerror = reject;
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
    
    const success = drawImageDataToCanvas(currentImageData, 'transformedCanvas');
    if (success) {
        showMessage('Imagen actualizada', 'success');
    } else {
        showMessage('Error al actualizar imagen', 'error');
    }
}

// ==========================================
// FUNCIONES PRINCIPALES
// ==========================================
function loadSampleImage() {
    try {
        console.log('Cargando imagen de ejemplo...');
        const sampleImageData = createSampleImage(400, 400);
        
        originalImageData = sampleImageData;
        currentImageData = sampleImageData;
        
        const success1 = drawImageDataToCanvas(sampleImageData, 'originalCanvas');
        const success2 = drawImageDataToCanvas(sampleImageData, 'transformedCanvas');
        
        if (success1 && success2) {
            showMessage('Imagen de ejemplo cargada', 'success');
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
            result = rotateImage(result, rotation);
        }
        
        if (scaleX !== 1 || scaleY !== 1) {
            result = scaleImage(result, scaleX, scaleY);
        }
        
        if (translateX !== 0 || translateY !== 0) {
            result = translateImage(result, translateX, translateY);
        }
        
        currentImageData = result;
        updateTransformedImage();
        
        showMessage('Transformación aplicada', 'success');
        
    } catch (error) {
        console.error('Error en transformación:', error);
        showMessage('Error al aplicar transformación', 'error');
    }
}

function reflectHorizontal() {
    if (!originalImageData) {
        showMessage('No hay imagen cargada', 'error');
        return;
    }
    
    try {
        const result = reflectImageHorizontal(originalImageData);
        currentImageData = result;
        updateTransformedImage();
        showMessage('Reflexión horizontal aplicada', 'success');
    } catch (error) {
        console.error('Error en reflexión:', error);
        showMessage('Error al aplicar reflexión', 'error');
    }
}

function reflectVertical() {
    if (!originalImageData) {
        showMessage('No hay imagen cargada', 'error');
        return;
    }
    
    try {
        const result = reflectImageVertical(originalImageData);
        currentImageData = result;
        updateTransformedImage();
        showMessage('Reflexión vertical aplicada', 'success');
    } catch (error) {
        console.error('Error en reflexión:', error);
        showMessage('Error al aplicar reflexión', 'error');
    }
}

function resetTransform() {
    if (!originalImageData) {
        showMessage('No hay imagen original', 'error');
        return;
    }
    
    try {
        currentImageData = originalImageData;
        updateTransformedImage();
        
        // Resetear sliders
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
        showMessage('Error al reiniciar', 'error');
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
                result = applyBlur(currentImageData, 3);
                break;
            case 'sharpen':
                result = applySharpen(currentImageData);
                break;
            case 'edge':
                result = applyEdgeDetection(currentImageData);
                break;
            case 'emboss':
                result = applyEmboss(currentImageData);
                break;
            case 'grayscale':
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
        showMessage('Error al aplicar filtro', 'error');
    }
}

function showMatrixView() {
    if (!currentImageData) {
        showMessage('No hay imagen cargada', 'error');
        return;
    }
    
    try {
        // Crear canvas para visualización
        const matrixCanvas = document.createElement('canvas');
        matrixCanvas.width = 200;
        matrixCanvas.height = 200;
        const ctx = matrixCanvas.getContext('2d');
        
        // Visualizar matriz de escala de grises simplificada
        const cellSize = 2;
        for (let y = 0; y < Math.min(currentImageData.height, 100); y++) {
            for (let x = 0; x < Math.min(currentImageData.width, 100); x++) {
                const index = (y * currentImageData.width + x) * 4;
                const gray = Math.round(0.299 * currentImageData.data[index] + 
                                   0.587 * currentImageData.data[index + 1] + 
                                   0.114 * currentImageData.data[index + 2]);
                
                ctx.fillStyle = `rgb(${gray}, ${gray}, ${gray})`;
                ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
            }
        }
        
        // Mostrar en diálogo
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
        `;
        
        dialog.innerHTML = `
            <h3>Matriz de Píxeles</h3>
            <p>Primeros 100x100 píxeles en escala de grises</p>
            <div style="margin: 10px 0;"></div>
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
        showMessage('Error al mostrar matriz', 'error');
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
        <p><strong>Traslación X:</strong> ${translateX}</p>
        <p><strong>Traslación Y:</strong> ${translateY}</p>
        
        <h4>Matriz de Rotación:</h4>
        <pre style="background: #f0f0f0; padding: 10px; border-radius: 5px;">
[cos(${rotation}°)  -sin(${rotation}°)]
[sin(${rotation}°)   cos(${rotation}°)]
        </pre>
        
        <h4>Matriz de Escalado:</h4>
        <pre style="background: #f0f0f0; padding: 10px; border-radius: 5px;">
[${scaleX}  0]
[0  ${scaleY}]
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
        // Calcular diferencia simple
        let totalDifference = 0;
        let pixelCount = 0;
        
        for (let i = 0; i < originalImageData.data.length; i += 4) {
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
        showMessage('Error al comparar imágenes', 'error');
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
    
    // Event listeners de archivos
    const imageInput = document.getElementById('imageInput');
    if (imageInput) {
        imageInput.addEventListener('change', handleFileUpload);
    }
    
    // Event listeners de sliders
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
    
    // Botones de transformación
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
    
    // Botones de filtros
    document.querySelectorAll('.btn').forEach(btn => {
        const text = btn.textContent.toLowerCase();
        if (text.includes('blur') || text.includes('sharpen') || 
            text.includes('edge') || text.includes('emboss') || 
            text.includes('grayscale')) {
            btn.addEventListener('click', () => applyFilter(text));
        }
    });
    
    // Botones de análisis
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

// ==========================================
// INICIO DE LA APLICACIÓN
// ==========================================
function startApp() {
    console.log('Iniciando aplicación...');
    
    // Verificar que los elementos necesarios existan
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
    
    // Inicializar event listeners
    initializeEventListeners();
    
    // Cargar imagen de ejemplo
    loadSampleImage();
    
    console.log('Aplicación iniciada correctamente');
}

// Iniciar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startApp);
} else {
    startApp();
}

// Hacer funciones globales accesibles
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

console.log('Script cargado');
