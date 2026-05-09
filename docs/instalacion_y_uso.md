# Guía de Instalación y Uso
## Editor Inteligente de Imágenes - Álgebra Lineal

---

## Requisitos del Sistema

### Mínimos
- **Navegador**: Chrome 80+, Firefox 75+, Safari 13+, Edge 80+
- **RAM**: 4 GB
- **Procesador**: Moderno con soporte JavaScript ES6+
- **Conexión**: Para cargar librerías externas (solo instalación inicial)

### Recomendados
- **Navegador**: Chrome 100+ o Firefox 100+
- **RAM**: 8 GB o más
- **Procesador**: Multi-core para mejor rendimiento
- **Pantalla**: 1920×1080 o superior para mejor experiencia

---

## Instalación

### Opción 1: Ejecución Directa (Recomendado)

1. **Descargar el proyecto**
   ```bash
   git clone https://github.com/tu-repo/algebra-lineal-imagenes.git
   cd algebra-lineal-imagenes
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Iniciar servidor de desarrollo**
   ```bash
   npm run dev
   ```

4. **Abrir en navegador**
   - Navegar a `http://localhost:3000`
   - La aplicación se iniciará automáticamente

### Opción 2: Versión Estática

1. **Construir versión optimizada**
   ```bash
   npm run build
   ```

2. **Servir archivos estáticos**
   ```bash
   # Usar cualquier servidor web
   python -m http.server 8000
   # o
   npx serve dist
   ```

3. **Abrir `http://localhost:8000`**

---

## Configuración

### Variables de Entorno

Crear archivo `.env` en la raíz:

```env
# Configuración del servidor
PORT=3000
HOST=localhost

# Configuración de la aplicación
MAX_IMAGE_SIZE=4096
DEFAULT_COMPRESSION_RATIO=0.5
ENABLE_ADVANCED_FEATURES=true

# Configuración de desarrollo
DEBUG=false
LOG_LEVEL=info
```

### Configuración Avanzada

Editar `webpack.config.js` para personalizar:

```javascript
module.exports = {
  // Personalizar puerto de desarrollo
  devServer: {
    port: process.env.PORT || 3000,
    host: process.env.HOST || 'localhost'
  },
  
  // Optimización de producción
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        }
      }
    }
  }
};
```

---

## Uso Básico

### Interfaz Principal

La interfaz se divide en tres áreas principales:

1. **Panel Lateral (Izquierda)**: Controles y herramientas
2. **Área de Imágenes (Centro)**: Vista original y transformada
3. **Área de Explicación (Abajo)**: Detalles matemáticos

### Cargar Imágenes

#### Método 1: Archivo Local
1. Hacer clic en "Seleccionar Archivo"
2. Elegir imagen PNG, JPG o JPEG
3. Esperar carga automática

#### Método 2: Imagen de Ejemplo
1. Hacer clic en "Cargar Imagen de Ejemplo"
2. Se generará una imagen de demostración

#### Método 3: Arrastrar y Soltar (Próximamente)
1. Arrastrar archivo al área de carga
2. Soltar para procesar automáticamente

---

## Funcionalidades Detalladas

### 1. Transformaciones Geométricas

#### Rotación
- **Control**: Slider (-180° a 180°)
- **Matemática**: `R(θ) = [[cos(θ), -sin(θ)], [sin(θ), cos(θ)]]`
- **Uso**: Arrastrar slider o ingresar valor directamente

#### Escalado
- **Control**: Sliders independientes para X e Y (0.1 a 3.0)
- **Matemática**: `S(sx, sy) = [[sx, 0], [0, sy]]`
- **Tip**: Mantener Shift para escalado uniforme

#### Traslación
- **Control**: Sliders para desplazamiento X e Y (-100 a 100)
- **Matemática**: Coordenadas homogéneas `T(tx, ty)`
- **Aplicación**: Hacer clic en "Aplicar Transformación"

#### Reflexión
- **Horizontal**: Invierte imagen horizontalmente
- **Vertical**: Invierte imagen verticalmente
- **Matemática**: Multiplicación por matriz de reflexión

### 2. Filtros Matemáticos

#### Blur (Desenfoque)
- **Algoritmo**: Convolución Gaussiana
- **Kernel**: 3×3 ajustable
- **Uso**: Clic en "Blur"

#### Sharpen (Enfoque)
- **Algoritmo**: Realce de alta frecuencia
- **Efecto": Aumenta contraste en bordes
- **Control**: Intensidad ajustable

#### Edge Detection (Bordes)
- **Algoritmo**: Operador Sobel
- **Salida**: Imagen binaria de bordes
- **Aplicaciones**: Detección de contornos

#### Emboss (Relieve)
- **Algoritmo**: Kernel asimétrico
- **Efecto**: Apariencia 3D
- **Intensidad**: Ajustable

#### Grayscale (Escala de Grises)
- **Fórmula**: `Gray = 0.299*R + 0.587*G + 0.114*B`
- **Resultado**: Imágenes monocromáticas
- **Ventajas**: Reducción dimensional

### 3. Análisis Matemático

#### Vista de Matrices
- **Función**: Visualizar valores numéricos de píxeles
- **Mapa de Colores**: Viridis, Plasma, Hot, etc.
- **Interacción**: Clic en celdas para ver valores

#### Matriz de Transformación
- **Mostrar**: Matriz actual de transformación
- **Formato**: Numérico con 3 decimales
- **Explicación**: Propiedades matemáticas

#### Comparación de Imágenes
- **Métricas**:
  - Distancia euclidiana
  - Similitud coseno
  - Diferencias por canal
- **Visualización**: Resultados numéricos y gráficos

### 4. Compresión SVD

#### Proceso
1. **Descomposición**: `A = UΣV^T`
2. **Reducción**: Mantener k componentes principales
3. **Reconstrucción**: `A_k = U_kΣ_kV_k^T`

#### Parámetros
- **Ratio**: 10% - 90% de componentes
- **Error**: RMSE y PSNR calculados
- **Optimización**: Balance calidad/tamaño

#### Resultados
- **Compresión**: Porcentaje de reducción
- **Calidad**: Métricas de error
- **Visual**: Comparación lado a lado

---

## Atajos de Teclado

### Navegación
- `Ctrl + O`: Abrir archivo
- `Ctrl + S`: Guardar imagen
- `Ctrl + Z`: Deshacer
- `Ctrl + Y`: Rehacer
- `Ctrl + R`: Resetear transformaciones

### Transformaciones
- `R`: Activar control de rotación
- `S`: Activar control de escalado
- `T`: Activar control de traslación
- `H`: Reflexión horizontal
- `V`: Reflexión vertical

### Filtros
- `B`: Aplicar blur
- `E`: Aplicar edge detection
- `G`: Convertir a escala de grises
- `Shift + S`: Aplicar sharpen

---

## Exportación y Guardado

### Guardar Imagen
1. Hacer clic en "Guardar Imagen"
2. Elegir nombre de archivo
3. Seleccionar formato (PNG, JPEG)
4. Confirmar ubicación

### Exportar Matrices
1. Hacer clic en "Exportar Matriz"
2. Formato JSON con estructura completa
3. Incluye todos los canales y metadatos

### Compartir Resultados
- **Captura de pantalla**: `PrtScn` o herramientas del navegador
- **Exportar análisis**: Copiar resultados matemáticos
- **Guardar configuración**: Próximamente disponible

---

## Solución de Problemas

### Problemas Comunes

#### Imagen No Carga
**Síntomas**: Error al cargar archivo, mensaje de error
**Soluciones**:
1. Verificar formato (PNG, JPG, JPEG)
2. Revisar tamaño (<10MB recomendado)
3. Limpiar caché del navegador
4. Usar navegador actualizado

#### Transformación No Visible
**Síntomas**: Slider se mueve pero no hay cambios
**Soluciones**:
1. Hacer clic en "Aplicar Transformación"
2. Verificar que imagen esté cargada
3. Revisar valores de transformación
4. Resetear y volver a intentar

#### Rendimiento Lento
**Síntomas**: Operaciones tardan mucho
**Soluciones**:
1. Reducir tamaño de imagen
2. Cerrar otras pestañas
3. Usar navegador recomendado
4. Verificar uso de RAM

#### Error de Memoria
**Síntomas**: Crasheo del navegador
**Soluciones**:
1. Usar imágenes más pequeñas
2. Limitar operaciones simultáneas
3. Reiniciar navegador
4. Aumentar RAM del sistema

### Mensajes de Error

#### "No hay imagen cargada"
- **Causa**: Intentar operar sin imagen
- **Solución**: Cargar imagen primero

#### "Error en transformación"
- **Causa**: Valores fuera de rango
- **Solución**: Verificar parámetros

#### "Memoria insuficiente"
- **Causa**: Imagen muy grande
- **Solución**: Reducir resolución

---

## Rendimiento y Optimización

### Recomendaciones de Rendimiento

#### Tamaño de Imagen Óptimo
- **Recomendado**: 800×600 a 1920×1080
- **Máximo**: 4096×4096 (con RAM suficiente)
- **Mínimo**: 100×100 (para pruebas rápidas)

#### Configuración del Navegador
- **Chrome**: Habilitar aceleración hardware
- **Firefox**: Configurar `canvas.accelerated`
- **Safari**: Habilitar WebGL

#### Configuración del Sistema
- **RAM**: 8GB+ para imágenes grandes
- **GPU**: Aceleración por hardware recomendada
- **Procesador**: Multi-core para mejor respuesta

### Métricas de Rendimiento

#### Tiempos de Procesamiento (Típicos)
- **Carga imagen**: <1s (1000×1000)
- **Transformación simple**: <100ms
- **Filtro convolución**: <200ms
- **Compresión SVD**: 1-5s (dependiendo de ratio)

#### Uso de Memoria
- **Base**: ~50MB
- **Imagen 1000×1000**: +12MB
- **Historial completo**: +100MB
- **Matrices temporales**: +50MB

---

## Extensiones y Personalización

### Plugins Comunitarios (Próximamente)

#### Filtros Adicionales
- **Artísticos**: Pintura, dibujo, acuarela
- **Técnicos**: Análisis de texturas, patrones
- **Divertidos**: Stickers, efectos especiales

#### Herramientas de Análisis
- **Histogramas avanzados**: Análisis por canal
- **Perfil de color**: Espacios CMYK, LAB
- **Métricas de calidad**: SSIM, PSNR, VMAF

#### Integraciones
- **Cloud Storage**: Google Drive, Dropbox
- **Social Media**: Compartir directamente
- **API**: Integración con otros servicios

### Desarrollo Personalizado

#### API JavaScript
```javascript
// Acceder al editor programáticamente
const editor = window.imageEditor;

// Aplicar transformación personalizada
const customMatrix = new Matrix([[1, 0.5], [0, 1]]);
editor.applyCustomTransform(customMatrix);

// Exportar resultados
const results = editor.getResults();
```

#### Eventos y Callbacks
```javascript
// Escuchar eventos
editor.on('imageLoaded', (imageData) => {
    console.log('Imagen cargada:', imageData.dimensions);
});

editor.on('transformApplied', (transform) => {
    console.log('Transformación aplicada:', transform);
});
```

#### Temas y Personalización Visual
```css
/* Personalizar colores */
:root {
    --primary-color: #3498db;
    --secondary-color: #2ecc71;
    --background-color: #f8f9fa;
}

/* Modo oscuro */
.dark-theme {
    --background-color: #2c3e50;
    --text-color: #ecf0f1;
}
```

---

## Soporte y Comunidad

### Obtener Ayuda

#### Documentación Adicional
- **API Reference**: Detalles de todas las funciones
- **Tutoriales**: Guías paso a paso
- **Ejemplos**: Casos de uso específicos

#### Foro Comunitario
- **Discusiones**: Compartir experiencias
- **Problemas**: Soluciones colaborativas
- **Solicitudes**: Nuevas funcionalidades

#### Reporte de Bugs
- **GitHub Issues**: Reportar problemas técnicos
- **Feedback**: Sugerencias de mejora
- **Contribuciones**: Código y documentación

### Recursos Educativos

#### Tutoriales en Video
- **Introducción al Álgebra Lineal**: Conceptos básicos
- **Procesamiento de Imágenes**: Técnicas fundamentales
- **Casos de Uso**: Aplicaciones reales

#### Artículos y Blogs
- **Fundamentos Matemáticos**: Explicaciones detalladas
- **Optimización**: Mejores prácticas
- **Investigación**: Últimos avances

#### Cursos Online
- **Coursera**: Matemáticas para Machine Learning
- **edX**: Procesamiento Digital de Señales
- **Udemy**: JavaScript Avanzado

---

## Actualizaciones y Mantenimiento

### Versiones y Lanzamientos

#### Versión Actual: 1.0.0
- **Características**: Todas las funcionalidades principales
- **Estabilidad**: Probada en producción
- **Documentación**: Completa y actualizada

#### Próximas Versiones
- **1.1.0**: Filtros adicionales y mejoras de UI
- **1.2.0**: API pública y plugins
- **2.0.0**: Machine Learning integrado

### Actualización Automática
- **Notificaciones**: Alertas de nuevas versiones
- **Descarga**: Actualizaciones automáticas opcionales
- **Migración**: Preservación de configuración

### Mantenimiento Programado
- **Limpieza de caché**: Automático cada 30 días
- **Optimización**: Mejoras de rendimiento continuas
- **Seguridad**: Parches de seguridad regulares

---

## Licencia y Derechos

### Licencia MIT
- **Uso comercial**: Permitido
- **Modificación**: Permitida
- **Distribución**: Permitida
- **Atribución**: Requerida

### Derechos de Autor
- **Código**: © 2024 Universidad Proyecto
- **Documentación**: Creative Commons BY-SA
- **Ejemplos**: Dominio público

### Términos de Servicio
- **Privacidad**: No se recopilan datos personales
- **Cookies**: Mínimas y necesarias
- **Terceros**: Sin seguimiento de terceros

---

*Esta guía está diseñada para ayudar a usuarios de todos los niveles a aprovechar al máximo el Editor Inteligente de Imágenes. Para preguntas adicionales, consulte la documentación completa o contacte al equipo de soporte.*
