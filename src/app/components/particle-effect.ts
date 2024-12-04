interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  alpha: number
  size: number
  originalX: number
  originalY: number
  color: string
}

// В начале файла добавим константы для настройки эффекта
const PARTICLE_SPEED = 15
const GRAVITY = 10
const FADE_SPEED = 0.97
const PARTICLE_SIZE_MULTIPLIER = 10

export const createParticleEffect = (imageElement: HTMLImageElement) => {
  const canvas = document.createElement('canvas')
  canvas.classList.add('particle-effect-canvas')

  const rect = imageElement.getBoundingClientRect()
  canvas.style.position = 'fixed'
  canvas.style.left = rect.left + 'px'
  canvas.style.top = rect.top + 'px'
  canvas.style.width = rect.width + 'px'
  canvas.style.height = rect.height + 'px'
  canvas.width = rect.width
  canvas.height = rect.height

  const ctx = canvas.getContext('2d')!

  ctx.drawImage(imageElement, 0, 0, canvas.width, canvas.height)

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const particles: Particle[] = []

  const pixelStep = 1 // меньше шаг = больше частиц
  for (let y = 0; y < imageData.height; y += pixelStep) {
    for (let x = 0; x < imageData.width; x += pixelStep) {
      const i = (y * imageData.width + x) * 4

      if (imageData.data[i + 3] < 128) continue

      const r = imageData.data[i]
      const g = imageData.data[i + 1]
      const b = imageData.data[i + 2]

      particles.push({
        x,
        y,
        originalX: x,
        originalY: y,
        vx: (Math.random() - 0.5) * PARTICLE_SPEED,
        vy: -Math.random() * PARTICLE_SPEED * 2,
        alpha: 1,
        size: pixelStep * PARTICLE_SIZE_MULTIPLIER,
        color: `rgb(${r},${g},${b})`,
      })
    }
  }

  const animate = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    let isAnimating = false

    particles.forEach((particle) => {
      particle.x += particle.vx
      particle.y += particle.vy
      particle.vy += GRAVITY
      particle.alpha *= FADE_SPEED

      if (particle.alpha > 0.01) {
        isAnimating = true
        ctx.fillStyle = particle.color.replace('rgb', 'rgba').replace(')', `,${particle.alpha})`)
        ctx.fillRect(particle.x, particle.y, particle.size, particle.size)
      }
    })

    if (isAnimating) {
      requestAnimationFrame(animate)
    } else {
      canvas.remove()
    }
  }

  return {
    canvas,
    start: () => {
      document.body.appendChild(canvas)
      animate()
    },
  }
}
