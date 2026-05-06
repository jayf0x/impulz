import { useState, useEffect, useRef } from 'preact/hooks'
import { Box, Flex, Text, Heading, Badge, VStack, Container, Code } from '@chakra-ui/react'
import { Canvas }     from './Canvas.jsx'
import { StatsPanel } from './StatsPanel.jsx'
import { EventLog }   from './EventLog.jsx'
import { HideModal }  from './HideModal.jsx'
import { usePulse }   from './usePulse.js'

const HOOK_CODE = `const { fps, visible, idle } = usePulse()

if (quality === 'high' && fps < 40) setQuality('low')
if (quality === 'low'  && fps > 70) setQuality('high')

// Tab hidden → impulz fires 'visibility'.
// Use that 200 ms window before the browser
// throttles you — sync, flush, heartbeat.`

function timestamp() {
  return new Date().toLocaleTimeString('en', {
    hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit',
  })
}

function LiveBadges({ fps, visible, idle, quality }) {
  const fpsScheme = fps == null ? 'gray' : fps >= 70 ? 'green' : fps >= 40 ? 'yellow' : 'red'
  return (
    <Flex gap={2} justify="center" flexWrap="wrap">
      <Badge colorScheme={fpsScheme} variant="subtle" px={3} py={1} borderRadius="full" fontFamily="mono" fontSize="sm">
        {fps ?? '—'} fps
      </Badge>
      <Badge colorScheme={quality === 'high' ? 'green' : 'red'} variant="subtle" px={3} py={1} borderRadius="full" fontSize="sm" fontFamily="mono">
        {quality?.toUpperCase()} quality
      </Badge>
      <Badge colorScheme={visible ? 'green' : 'red'} variant="subtle" px={3} py={1} borderRadius="full" fontSize="sm">
        tab {visible ? 'active' : 'hidden'}
      </Badge>
      <Badge colorScheme={idle ? 'yellow' : 'green'} variant="subtle" px={3} py={1} borderRadius="full" fontSize="sm">
        {idle ? 'idle' : 'active'}
      </Badge>
    </Flex>
  )
}

function ParticleSlider({ value, onChange }) {
  return (
    <Box
      bg="rgba(255,255,255,0.03)"
      border="1px solid rgba(255,255,255,0.07)"
      borderRadius="xl"
      px={5} py={4}
    >
      <Flex justify="space-between" align="baseline" mb={3}>
        <Text fontSize="10px" letterSpacing="0.15em" textTransform="uppercase" color="whiteAlpha.400" fontFamily="mono">
          Particle count
        </Text>
        <Text fontSize="xl" fontWeight="700" fontFamily="mono" color="white">
          {value.toLocaleString()}
        </Text>
      </Flex>
      <input
        className="particle-slider"
        type="range"
        min={100}
        max={1000 * 100}
        step={50}
        value={value}
        onInput={e => onChange(parseInt(e.target.value, 10))}
      />
      <Flex justify="space-between" mt={1}>
        <Text fontSize="9px" color="whiteAlpha.200" fontFamily="mono">100</Text>
        <Text fontSize="9px" color="whiteAlpha.200" fontFamily="mono">10 000</Text>
      </Flex>
    </Box>
  )
}

export function App() {
  const { fps, visible, idle } = usePulse()

  const [quality,       setQuality]       = useState('high')
  const [particleCount, setParticleCount] = useState(200)
  const [events,        setEvents]        = useState([])
  const [modal,         setModal]         = useState(null)  // null | { awayMs }

  const qualityLockRef = useRef(0)
  const hiddenAtRef    = useRef(null)
  const mountedRef     = useRef(false)
  const idleInitRef    = useRef(false)

  function addEvent(message, color) {
    setEvents(prev => [{ time: timestamp(), message, color }, ...prev].slice(0, 80))
  }

  // Boot
  useEffect(() => {
    addEvent('impulz started — visibility · fps · idle', '#4ade80')
  }, [])

  // ── Quality rules (fps) ───────────────────────────────────────────────────
  useEffect(() => {
    if (fps === null) return
    const now = Date.now()

    if (quality === 'high' && fps < 40) {
      setQuality('low')
      qualityLockRef.current = now + 4000
      addEvent(`Quality ↓ LOW — fps dropped to ${fps}`, '#ef4444')
    } else if (quality === 'low' && fps > 70 && now > qualityLockRef.current) {
      setQuality('high')
      addEvent(`Quality ↑ HIGH — fps recovered to ${fps}`, '#4ade80')
    }
  }, [fps, quality])

  // ── Visibility changes ────────────────────────────────────────────────────
  useEffect(() => {
    if (!mountedRef.current) { mountedRef.current = true; return }

    if (!visible) {
      hiddenAtRef.current = Date.now()
      setQuality('low')
      qualityLockRef.current = Date.now() + 4000
      addEvent('Tab hidden — quality set to LOW, monitoring…', '#f59e0b')
    } else {
      const awayMs = hiddenAtRef.current ? Date.now() - hiddenAtRef.current : 0
      hiddenAtRef.current = null
      addEvent(
        awayMs >= 1000
          ? `Tab visible — back after ${Math.round(awayMs / 1000)}s`
          : 'Tab visible — resumed',
        '#4ade80',
      )
      if (awayMs > 200) setModal({ awayMs })
    }
  }, [visible])

  // ── Idle changes ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!idleInitRef.current) { idleInitRef.current = true; return }
    if (idle) addEvent('User idle — analytics buffer ready to flush', '#f59e0b')
    else      addEvent('User active again', 'rgba(255,255,255,0.35)')
  }, [idle])

  return (
    <Box minH="100vh" bg="#080808" py={14} px={4}>
      <Container maxW="900px">
        <VStack gap={10} align="stretch">

          {/* ── Hero ── */}
          <VStack gap={5} textAlign="center" pb={2}>
            <Badge
              variant="outline"
              px={3} py={1}
              borderRadius="full"
              fontSize="11px"
              letterSpacing="0.2em"
              fontFamily="mono"
              color="#4ade80"
              borderColor="#4ade8044"
            >
              ⚡ IMPULZ
            </Badge>

            <Heading
              as="h1"
              fontSize={{ base: '36px', md: '56px' }}
              fontWeight="800"
              lineHeight={1.08}
              letterSpacing="-0.03em"
              color="white"
            >
              The hook you never
              <Box as="span" color="#4ade80" display="block">thought you needed.</Box>
            </Heading>

            <Text color="whiteAlpha.500" fontSize={{ base: 'md', md: 'lg' }} maxW="460px" lineHeight={1.6}>
              Zero-dependency browser signals — visibility, FPS, and idle state —
              wired to your UI in one hook.
            </Text>

            <LiveBadges fps={fps} visible={visible} idle={idle} quality={quality} />
          </VStack>

          {/* ── Canvas ── */}
          <Box
            borderRadius="2xl"
            overflow="hidden"
            border="1px solid rgba(255,255,255,0.07)"
            boxShadow="0 0 80px rgba(74,222,128,0.05), 0 40px 100px rgba(0,0,0,0.8)"
          >
            <Canvas quality={quality} particleCount={particleCount} visible={visible} />
          </Box>

          {/* ── Slider ── */}
          <ParticleSlider value={particleCount} onChange={setParticleCount} />

          {/* ── Code ── */}
          <Box bg="#0d0d0d" border="1px solid rgba(255,255,255,0.07)" borderRadius="2xl" overflow="hidden">
            <Flex align="center" justify="space-between" px={6} py={4} borderBottom="1px solid rgba(255,255,255,0.06)">
              <Text fontSize="11px" letterSpacing="0.15em" textTransform="uppercase" color="whiteAlpha.400" fontFamily="mono">
                All it takes
              </Text>
              <Flex gap={2}>
                {['#ff5f57', '#febc2e', '#28c840'].map(c => (
                  <Box key={c} w="10px" h="10px" borderRadius="full" bg={c} opacity={0.7} />
                ))}
              </Flex>
            </Flex>
            <Box px={6} py={5}>
              <Code
                display="block"
                whiteSpace="pre"
                bg="transparent"
                color="#d8d8d8"
                fontSize={{ base: '13px', md: '14px' }}
                lineHeight={1.85}
                fontFamily="mono"
              >
                {HOOK_CODE}
              </Code>
            </Box>
          </Box>

          {/* ── Stats ── */}
          <StatsPanel fps={fps} visible={visible} idle={idle} quality={quality} particleCount={particleCount} />

          {/* ── Event log ── */}
          <EventLog events={events} />

          {/* ── Hint ── */}
          <Text color="whiteAlpha.200" fontSize="sm" textAlign="center" fontStyle="italic" pb={2}>
            Switch tabs · stop moving · crank up particles to 10k — watch quality react.
          </Text>

        </VStack>
      </Container>

      {/* ── Modal ── */}
      {modal && (
        <HideModal
          awayMs={modal.awayMs}
          onDone={() => setModal(null)}
        />
      )}
    </Box>
  )
}
