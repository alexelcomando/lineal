/**
 * Archivo Principal - Editor Inteligente de Imágenes
 * Integración de todos los módulos de álgebra lineal y procesamiento de imágenes
 */

// Importar módulos de álgebra lineal
import { MatrixOperations } from './algebra/matrices.js';
import { VectorOperations } from './algebra/vectors.js';
import { LinearTransformations } from './algebra/transformations.js';
import { ConvolutionOperations } from './algebra/convolution.js';

// Importar módulos de procesamiento de imágenes
import { ImageLoader } from './image/loader.js';
import { ImageFilters } from './image/filters.js';
import { EdgeDetection } from './image/edge_detection.js';
import { ImageCompression } from './image/compression.js';

// Importar módulos de visualización
import { MatrixVisualization } from './visualization/matrix_view.js';
import { VectorVisualization } from './visualization/vector_view.js';
import { MathematicalGraphs } from './visualization/graphs.js';

/**
 * Clase principal del Editor Inteligente de Imágenes
 */
class ImageEditor {
    constructor() {
        this.originalImage = null;
        this.currentImage = null;
        this.originalMatrices = null;
        this.currentMatrices = null;
        this.currentTransform = null;
        this.history = [];
        this.historyIndex = -1;
        
        this.initializeEventListeners();
        this.loadSampleImage();
    }
    
    /**
     * Inicializa todos los event listeners
     */
    initializeEventListeners() {
        // Event listeners de archivos
        document.getElementById('imageInput').addEventListener('change', (e) => this.handleImageUpload(e));
        
        // Event listeners de transformaciones geométricas
        document.getElementById('rotationSlider').addEventListener('input', (e) => this.updateSliderValue('rotation', e.target.value));
        document.getElementById('scaleXSlider').addEventListener('input', (e) => this.updateSliderValue('scaleX', e.target.value));
        document.getElementById('scaleYSlider').addEventListener('input', (e) => this.updateSliderValue('scaleY', e.target.value));
        document.getElementById('translateXSlider').addEventListener('input', (e) => this.updateSliderValue('translateX', e.target.value));
        document.getElementById('translateYSlider').addEventListener('input', (e) => this.updateSliderValue('translateY', e.target.value));
        
        // Botones de transformación
        document.getElementById('applyGeometricTransform').addEventListener('click', () => this.applyGeometricTransform());
        document.getElementById('reflectHorizontal').addEventListener('click', () => this.reflectHorizontal());
        document.getElementById('reflectVertical').addEventListener('click', () => this.reflectVertical());
        document.getElementById('resetTransform').addEventListener('click', () => this.resetTransform());
        
        // Botones de filtros
        document.querySelectorAll('.btn').forEach(btn => {
            if (btn.textContent.includes('Blur') || btn.textContent.includes('Sharpen') || 
                btn.textContent.includes('Edge') || btn.textContent.includes('Emboss') || 
                btn.textContent.includes('Grayscale')) {
                btn.addEventListener('click', () => this.applyFilter(btn.textContent.toLowerCase()));
            }
        });
        
        // Botones de análisis
        document.getElementById('showMatrixView').addEventListener('click', () => this.showMatrixView());
        document.getElementById('showTransformationMatrix').addEventListener('click', () => this.showTransformationMatrix());
        document.getElementById('compareImages').addEventListener('click', () => this.compareImages());
        document.getElementById('applySVDCompression').addEventListener('click', () => this.applySVDCompression());
        
        // Botones de guardado
        document.getElementById('saveImage').addEventListener('click', () => this.saveImage());
        document.getElementById('exportMatrix').addEventListener('click', () => this.exportMatrix());
    }
    
    /**
     * Maneja la carga de imágenes
     */
    async handleImageUpload(event) {
        const file = event.target.files[0];
        if (file) {
            try {
                this.showMessage('Cargando imagen...', 'info');
                const imageData = await ImageLoader.loadImageFromFile(file);
                this.setImageData(imageData);
                this.showMessage('Imagen cargada exitosamente', 'success');
            } catch (error) {
                this.showMessage('Error al cargar la imagen: ' + error.message, 'error');
            }
        }
    }
    
    /**
     * Carga una imagen de ejemplo
     */
    async loadSampleImage() {
        try {
            const sampleImageData = ImageLoader.createSampleImage(400, 400, 'gradient');
            const canvas = document.getElementById('originalCanvas');
            ImageLoader.drawImageDataToCanvas(sampleImageData, canvas);
            
            // Convertir a matrices
            const matrices = ImageLoader.imageDataToMatrices(sampleImageData);
            this.setImageData({
                matrices: matrices,
                imageData: sampleImageData,
                width: 400,
                height: 400
            });
            
            this.showMessage('Imagen de ejemplo cargada', 'success');
        } catch (error) {
            this.showMessage('Error al cargar imagen de ejemplo: ' + error.message, 'error');
        }
    }
    
    /**
     * Establece los datos de imagen actuales
     */
    setImageData(imageData) {
        this.originalImage = imageData;
        this.currentImage = JSON.parse(JSON.stringify(imageData));
        this.originalMatrices = imageData.matrices;
        this.currentMatrices = JSON.parse(JSON.stringify(imageData.matrices));
        
        // Actualizar canvas
        const originalCanvas = document.getElementById('originalCanvas');
        const transformedCanvas = document.getElementById('transformedCanvas');
        
        ImageLoader.drawImageDataToCanvas(imageData.imageData, originalCanvas);
        ImageLoader.drawImageDataToCanvas(imageData.imageData, transformedCanvas);
        
        this.addToHistory();
    }
    
    /**
     * Actualiza valores de sliders
     */
    updateSliderValue(type, value) {
        const displayElement = document.getElementById(type + 'Value');
        if (displayElement) {
            let formattedValue = value;
            if (type === 'rotation') {
                formattedValue = value + '°';
            } else if (type.includes('scale')) {
                formattedValue = parseFloat(value).toFixed(1);
            }
            displayElement.textContent = formattedValue;
        }
    }
    
    /**
     * Aplica transformaciones geométricas
     */
    applyGeometricTransform() {
        if (!this.currentMatrices) {
            this.showMessage('No hay imagen cargada', 'error');
            return;
        }
        
        try {
            // Obtener parámetros
            const rotation = parseFloat(document.getElementById('rotationSlider').value) * Math.PI / 180;
            const scaleX = parseFloat(document.getElementById('scaleXSlider').value);
            const scaleY = parseFloat(document.getElementById('scaleYSlider').value);
            const translateX = parseFloat(document.getElementById('translateXSlider').value);
            const translateY = parseFloat(document.getElementById('translateYSlider').value);
            
            // Crear matriz de transformación compuesta
            const transformParams = {
                rotation: rotation,
                scaleX: scaleX,
                scaleY: scaleY,
                translateX: translateX,
                translateY: translateY
            };
            
            this.currentTransform = LinearTransformations.createCompositeTransform(transformParams);
            
            // Aplicar transformación a cada canal
            const transformedMatrices = {};
            for (const channel in this.currentMatrices) {
                if (channel !== 'original') {
                    transformedMatrices[channel] = LinearTransformations.transformImage(
                        this.currentMatrices[channel],
                        this.currentTransform,
                        this.currentImage.width,
                        this.currentImage.height
                    );
                }
            }
            
            this.currentMatrices = transformedMatrices;
            this.updateTransformedImage();
            this.showMathematicalExplanation('transform', transformParams);
            this.showMessage('Transformación aplicada exitosamente', 'success');
            
        } catch (error) {
            this.showMessage('Error en transformación: ' + error.message, 'error');
        }
    }
    
    /**
     * Aplica reflexión horizontal
     */
    reflectHorizontal() {
        if (!this.currentMatrices) {
            this.showMessage('No hay imagen cargada', 'error');
            return;
        }
        
        try {
            const transformMatrix = LinearTransformations.reflectionHorizontalMatrix3D();
            
            const transformedMatrices = {};
            for (const channel in this.currentMatrices) {
                if (channel !== 'original') {
                    transformedMatrices[channel] = LinearTransformations.transformImage(
                        this.currentMatrices[channel],
                        transformMatrix,
                        this.currentImage.width,
                        this.currentImage.height
                    );
                }
            }
            
            this.currentMatrices = transformedMatrices;
            this.updateTransformedImage();
            this.showMathematicalExplanation('reflection', { type: 'horizontal' });
            this.showMessage('Reflexión horizontal aplicada', 'success');
            
        } catch (error) {
            this.showMessage('Error en reflexión: ' + error.message, 'error');
        }
    }
    
    /**
     * Aplica reflexión vertical
     */
    reflectVertical() {
        if (!this.currentMatrices) {
            this.showMessage('No hay imagen cargada', 'error');
            return;
        }
        
        try {
            const transformMatrix = LinearTransformations.reflectionVerticalMatrix3D();
            
            const transformedMatrices = {};
            for (const channel in this.currentMatrices) {
                if (channel !== 'original') {
                    transformedMatrices[channel] = LinearTransformations.transformImage(
                        this.currentMatrices[channel],
                        transformMatrix,
                        this.currentImage.width,
                        this.currentImage.height
                    );
                }
            }
            
            this.currentMatrices = transformedMatrices;
            this.updateTransformedImage();
            this.showMathematicalExplanation('reflection', { type: 'vertical' });
            this.showMessage('Reflexión vertical aplicada', 'success');
            
        } catch (error) {
            this.showMessage('Error en reflexión: ' + error.message, 'error');
        }
    }
    
    /**
     * Reinicia todas las transformaciones
     */
    resetTransform() {
        if (!this.originalMatrices) {
            this.showMessage('No hay imagen original', 'error');
            return;
        }
        
        this.currentMatrices = JSON.parse(JSON.stringify(this.originalMatrices));
        this.currentTransform = null;
        
        // Resetear sliders
        document.getElementById('rotationSlider').value = 0;
        document.getElementById('scaleXSlider').value = 1;
        document.getElementById('scaleYSlider').value = 1;
        document.getElementById('translateXSlider').value = 0;
        document.getElementById('translateYSlider').value = 0;
        
        // Actualizar valores mostrados
        this.updateSliderValue('rotation', 0);
        this.updateSliderValue('scaleX', 1);
        this.updateSliderValue('scaleY', 1);
        this.updateSliderValue('translateX', 0);
        this.updateSliderValue('translateY', 0);
        
        this.updateTransformedImage();
        this.hideMathematicalExplanation();
        this.showMessage('Transformaciones reiniciadas', 'success');
    }
    
    /**
     * Aplica filtros matemáticos
     */
    applyFilter(filterType) {
        if (!this.currentMatrices) {
            this.showMessage('No hay imagen cargada', 'error');
            return;
        }
        
        try {
            let filterFunction;
            let explanation;
            
            switch (filterType) {
                case 'blur':
                    filterFunction = (matrix) => ImageFilters.applyBlur(matrix, 3);
                    explanation = ImageFilters.explainFilter('blur');
                    break;
                case 'sharpen':
                    filterFunction = (matrix) => ImageFilters.applySharpen(matrix, 1.0);
                    explanation = ImageFilters.explainFilter('sharpen');
                    break;
                case 'edge':
                    filterFunction = (matrix) => ImageFilters.applyEdgeDetection(matrix, 50);
                    explanation = ImageFilters.explainFilter('edge');
                    break;
                case 'emboss':
                    filterFunction = (matrix) => ImageFilters.applyEmboss(matrix, 1.0);
                    explanation = ImageFilters.explainFilter('emboss');
                    break;
                case 'grayscale':
                    // Para escala de grises, necesitamos todos los canales
                    const grayscaleMatrix = ImageFilters.applyGrayscale(this.currentMatrices);
                    this.currentMatrices = {
                        red: grayscaleMatrix.clone(),
                        green: grayscaleMatrix.clone(),
                        blue: grayscaleMatrix.clone(),
                        alpha: this.currentMatrices.alpha.clone(),
                        grayscale: grayscaleMatrix
                    };
                    this.updateTransformedImage();
                    this.showMathematicalExplanation('filter', explanation);
                    this.showMessage('Filtro de escala de grises aplicado', 'success');
                    return;
                default:
                    this.showMessage('Filtro no reconocido', 'error');
                    return;
            }
            
            // Aplicar filtro a cada canal
            const filteredMatrices = {};
            for (const channel in this.currentMatrices) {
                if (channel !== 'original') {
                    filteredMatrices[channel] = filterFunction(this.currentMatrices[channel]);
                }
            }
            
            this.currentMatrices = filteredMatrices;
            this.updateTransformedImage();
            this.showMathematicalExplanation('filter', explanation);
            this.showMessage(`Filtro ${filterType} aplicado`, 'success');
            
        } catch (error) {
            this.showMessage('Error al aplicar filtro: ' + error.message, 'error');
        }
    }
    
    /**
     * Muestra vista de matrices
     */
    showMatrixView() {
        if (!this.currentMatrices) {
            this.showMessage('No hay imagen cargada', 'error');
            return;
        }
        
        try {
            // Crear canvas para visualización de matriz
            const matrixCanvas = document.createElement('canvas');
            matrixCanvas.width = 300;
            matrixCanvas.height = 300;
            
            // Visualizar matriz de escala de grises
            const visualization = MatrixVisualization.visualizeMatrix(
                matrixCanvas,
                this.currentMatrices.grayscale,
                {
                    cellSize: 5,
                    colorMap: 'viridis',
                    showValues: false
                }
            );
            
            // Mostrar en una ventana modal o panel
            this.showMatrixDialog(matrixCanvas, visualization);
            this.showMessage('Vista de matriz generada', 'success');
            
        } catch (error) {
            this.showMessage('Error al mostrar matriz: ' + error.message, 'error');
        }
    }
    
    /**
     * Muestra matriz de transformación
     */
    showTransformationMatrix() {
        if (!this.currentTransform) {
            this.showMessage('No hay transformación activa', 'error');
            return;
        }
        
        try {
            const explanation = LinearTransformations.explainTransformation(
                this.currentTransform,
                'composite'
            );
            
            // Mostrar matriz formateada
            const matrixContent = MatrixOperations.formatMatrix(this.currentTransform, 3);
            
            document.getElementById('matrixContent').textContent = matrixContent;
            document.getElementById('matrixDisplay').style.display = 'block';
            
            this.showMessage('Matriz de transformación mostrada', 'success');
            
        } catch (error) {
            this.showMessage('Error al mostrar matriz: ' + error.message, 'error');
        }
    }
    
    /**
     * Compara imágenes original y transformada
     */
    compareImages() {
        if (!this.originalMatrices || !this.currentMatrices) {
            this.showMessage('Se necesitan ambas imágenes para comparar', 'error');
            return;
        }
        
        try {
            // Calcular diferencias
            const differences = {};
            for (const channel in this.originalMatrices) {
                if (channel !== 'original') {
                    const diff = MatrixOperations.subtract(
                        this.currentMatrices[channel],
                        this.originalMatrices[channel]
                    );
                    differences[channel] = MatrixOperations.norm(diff, 'frobenius');
                }
            }
            
            // Calcular similitud
            const originalVector = this.originalMatrices.grayscale.to1DArray();
            const currentVector = this.currentMatrices.grayscale.to1DArray();
            
            const euclideanDistance = VectorOperations.euclideanDistance(originalVector, currentVector);
            const cosineSimilarity = VectorOperations.cosineSimilarity(originalVector, currentVector);
            
            // Mostrar resultados
            const comparisonResult = `
                <h4>Resultados de Comparación</h4>
                <p><strong>Distancia Euclidiana:</strong> ${euclideanDistance.toFixed(2)}</p>
                <p><strong>Similitud Coseno:</strong> ${cosineSimilarity.toFixed(4)}</p>
                <p><strong>Diferencias por canal:</strong></p>
                <ul>
                    <li>Rojo: ${differences.red.toFixed(2)}</li>
                    <li>Verde: ${differences.green.toFixed(2)}</li>
                    <li>Azul: ${differences.blue.toFixed(2)}</li>
                </ul>
            `;
            
            this.showComparisonDialog(comparisonResult);
            this.showMessage('Comparación completada', 'success');
            
        } catch (error) {
            this.showMessage('Error en comparación: ' + error.message, 'error');
        }
    }
    
    /**
     * Aplica compresión SVD
     */
    applySVDCompression() {
        if (!this.currentMatrices) {
            this.showMessage('No hay imagen cargada', 'error');
            return;
        }
        
        try {
            const compressionRatio = 0.5; // 50% de compresión
            
            // Comprimir cada canal
            const compressedMatrices = {};
            const compressionResults = {};
            
            for (const channel in this.currentMatrices) {
                if (channel !== 'original') {
                    const result = ImageCompression.compressWithSVD(
                        this.currentMatrices[channel],
                        compressionRatio
                    );
                    compressedMatrices[channel] = result.compressedMatrix;
                    compressionResults[channel] = result;
                }
            }
            
            this.currentMatrices = compressedMatrices;
            this.updateTransformedImage();
            
            // Mostrar resultados de compresión
            const avgCompression = Object.values(compressionResults)
                .reduce((sum, result) => sum + result.compressionRatio, 0) / Object.keys(compressionResults).length;
            const avgError = Object.values(compressionResults)
                .reduce((sum, result) => sum + result.error, 0) / Object.keys(compressionResults).length;
            
            const compressionInfo = `
                <h4>Resultados de Compresión SVD</h4>
                <p><strong>Ratio de compresión promedio:</strong> ${(avgCompression * 100).toFixed(1)}%</p>
                <p><strong>Espacio ahorrado:</strong> ${((1 - avgCompression) * 100).toFixed(1)}%</p>
                <p><strong>Error de reconstrucción promedio:</strong> ${avgError.toFixed(2)}</p>
                <p><strong>Rango original:</strong> ${compressionResults.red.originalRank}</p>
                <p><strong>Rango comprimido:</strong> ${compressionResults.red.compressedRank}</p>
            `;
            
            this.showCompressionDialog(compressionInfo);
            this.showMessage('Compresión SVD aplicada', 'success');
            
        } catch (error) {
            this.showMessage('Error en compresión: ' + error.message, 'error');
        }
    }
    
    /**
     * Guarda la imagen transformada
     */
    saveImage() {
        if (!this.currentMatrices) {
            this.showMessage('No hay imagen para guardar', 'error');
            return;
        }
        
        try {
            const canvas = document.getElementById('transformedCanvas');
            ImageLoader.saveImage(canvas, 'imagen_transformada', 'png');
            this.showMessage('Imagen guardada exitosamente', 'success');
        } catch (error) {
            this.showMessage('Error al guardar imagen: ' + error.message, 'error');
        }
    }
    
    /**
     * Exporta matrices a formato JSON
     */
    exportMatrix() {
        if (!this.currentMatrices) {
            this.showMessage('No hay matrices para exportar', 'error');
            return;
        }
        
        try {
            ImageLoader.exportMatricesToJSON(this.currentMatrices, 'matrices_imagen');
            this.showMessage('Matrices exportadas exitosamente', 'success');
        } catch (error) {
            this.showMessage('Error al exportar matrices: ' + error.message, 'error');
        }
    }
    
    /**
     * Actualiza la imagen transformada en el canvas
     */
    updateTransformedImage() {
        try {
            const imageData = ImageLoader.matricesToImageData(
                this.currentMatrices,
                this.currentImage.width,
                this.currentImage.height,
                'color'
            );
            
            const canvas = document.getElementById('transformedCanvas');
            ImageLoader.drawImageDataToCanvas(imageData, canvas);
            
            this.addToHistory();
        } catch (error) {
            this.showMessage('Error al actualizar imagen: ' + error.message, 'error');
        }
    }
    
    /**
     * Muestra explicación matemática
     */
    showMathematicalExplanation(type, data) {
        const explanationDiv = document.getElementById('mathematicalExplanation');
        const explanationText = document.getElementById('explanationText');
        const formulaDisplay = document.getElementById('formulaDisplay');
        
        let explanation = '';
        let formula = '';
        
        switch (type) {
            case 'transform':
                explanation = `Transformación aplicada con parámetros:
                Rotación: ${(data.rotation * 180 / Math.PI).toFixed(1)}°
                Escalado: (${data.scaleX.toFixed(2)}, ${data.scaleY.toFixed(2)})
                Traslación: (${data.translateX}, ${data.translateY})`;
                
                formula = `T = R(θ) · S(sx,sy) · T(tx,ty)`;
                break;
                
            case 'reflection':
                explanation = `Reflexión ${data.type} aplicada. Esta transformación invierte las coordenadas en el eje ${data.type}.`;
                formula = data.type === 'horizontal' ? 
                    'Ref_x = [[-1, 0, 0], [0, 1, 0], [0, 0, 1]]' :
                    'Ref_y = [[1, 0, 0], [0, -1, 0], [0, 0, 1]]';
                break;
                
            case 'filter':
                explanation = data.description;
                formula = data.formula;
                break;
        }
        
        explanationText.innerHTML = explanation.replace(/\n/g, '<br>');
        formulaDisplay.textContent = formula;
        explanationDiv.style.display = 'block';
    }
    
    /**
     * Oculta explicación matemática
     */
    hideMathematicalExplanation() {
        document.getElementById('mathematicalExplanation').style.display = 'none';
    }
    
    /**
     * Muestra mensaje de estado
     */
    showMessage(message, type = 'info') {
        const messageDiv = document.getElementById('statusMessage');
        messageDiv.className = type;
        messageDiv.textContent = message;
        
        // Auto-ocultar después de 3 segundos
        setTimeout(() => {
            messageDiv.textContent = '';
            messageDiv.className = '';
        }, 3000);
    }
    
    /**
     * Agrega estado al historial
     */
    addToHistory() {
        // Eliminar estados futuros si estamos en medio del historial
        if (this.historyIndex < this.history.length - 1) {
            this.history = this.history.slice(0, this.historyIndex + 1);
        }
        
        // Agregar nuevo estado
        this.history.push(JSON.parse(JSON.stringify(this.currentMatrices)));
        this.historyIndex = this.history.length - 1;
        
        // Limitar historial a 20 estados
        if (this.history.length > 20) {
            this.history.shift();
            this.historyIndex--;
        }
    }
    
    /**
     * Muestra diálogo de matriz
     */
    showMatrixDialog(canvas, visualization) {
        // Implementación simple - en producción usar modal proper
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
            max-width: 90%;
            max-height: 90%;
            overflow: auto;
        `;
        
        dialog.innerHTML = `
            <h3>Visualización de Matriz</h3>
            <p>Rango de valores: ${visualization.range.min.toFixed(2)} - ${visualization.range.max.toFixed(2)}</p>
            <div style="text-align: center; margin: 10px 0;"></div>
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
        
        dialog.querySelector('div').appendChild(canvas);
        document.body.appendChild(dialog);
    }
    
    /**
     * Muestra diálogo de comparación
     */
    showComparisonDialog(content) {
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
            ${content}
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
    }
    
    /**
     * Muestra diálogo de compresión
     */
    showCompressionDialog(content) {
        this.showComparisonDialog(content);
    }
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.imageEditor = new ImageEditor();
    
    // Hacer funciones globales accesibles para los botones
    window.loadSampleImage = () => window.imageEditor.loadSampleImage();
    window.applyGeometricTransform = () => window.imageEditor.applyGeometricTransform();
    window.reflectHorizontal = () => window.imageEditor.reflectHorizontal();
    window.reflectVertical = () => window.imageEditor.reflectVertical();
    window.resetTransform = () => window.imageEditor.resetTransform();
    window.applyFilter = (type) => window.imageEditor.applyFilter(type);
    window.showMatrixView = () => window.imageEditor.showMatrixView();
    window.showTransformationMatrix = () => window.imageEditor.showTransformationMatrix();
    window.compareImages = () => window.imageEditor.compareImages();
    window.applySVDCompression = () => window.imageEditor.applySVDCompression();
    window.saveImage = () => window.imageEditor.saveImage();
    window.exportMatrix = () => window.imageEditor.exportMatrix();
});

// Exportar para uso modular
export { ImageEditor };
