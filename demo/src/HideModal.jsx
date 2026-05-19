import { useState, useEffect, useRef } from 'preact/hooks'
import { Box, Flex, Text, Heading } from '@chakra-ui/react'

const DURATION = 5000

const STEPS = [
  { label: 'Flushing analytics buffer…',    from: 100, to: 75 },
  { label: 'Syncing offline mutations…',     from: 75,  to: 50 },
  { label: 'Sending session heartbeat…',     from: 50,  to: 25 },
  { label: 'Resuming UI state…',             from: 25,  to: 0  },
]

function currentLabel(pct) {
  return STEPS.find(s => pct > s.to)?.label ?? 'Done.'
}

const USE_CASES = [
  { icon: '⚡', text: 'Flush pending analytics before the tab goes stale' },
  { icon: '🔄', text: 'Sync offline mutations back to your database' },
  { icon: '💓', text: 'Send a session heartbeat to keep auth alive' },
  { icon: '🎨', text: 'Gracefully degrade UI quality instead of freezing' },
]

export function HideModal({ awayMs, onDone }) {
  const [progress, setProgress] = useState(100)
  const rafRef   = useRef(null)
  const startRef = useRef(null)

  const awayS = Math.round(awayMs / 1000)

  useEffect(() => {
    // Accumulate time only between rAF frames — rAF pauses when the tab is
    // hidden, but performance.now() keeps ticking, so wall-clock elapsed would
    // jump forward when the user returns and instantly close the modal.
    let elapsed = 0
    let lastFrame = null

    function tick(now) {
      if (lastFrame !== null) elapsed += now - lastFrame
      lastFrame = now

      const pct = Math.max(0, 100 - (elapsed / DURATION) * 100)
      setProgress(pct)
      if (pct > 0) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        setTimeout(onDone, 300)
      }
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  return (
    <Box
      position="fixed"
      inset={0}
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg="rgba(0,0,0,0.72)"
      style={{ backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)' }}
      zIndex={200}
    >
      <Box
        bg="rgba(9,9,9,0.98)"
        border="1px solid rgba(255,255,255,0.09)"
        borderRadius="2xl"
        p={8}
        maxW="440px"
        w="90%"
        boxShadow="0 0 0 1px rgba(255,255,255,0.03), 0 32px 90px rgba(0,0,0,0.95)"
      >

        {/* eyebrow */}
        <Flex align="center" gap={2} mb={3}>
          <Box w="6px" h="6px" borderRadius="full" bg="#4ade80" style={{ animation: 'pulse-dot 1.2s ease infinite' }} />
          <Text fontSize="10px" letterSpacing="0.18em" textTransform="uppercase" color="whiteAlpha.400" fontFamily="mono">
            {awayS > 0 ? `Away for ${awayS}s` : 'Tab was hidden'}
          </Text>
        </Flex>

        {/* heading */}
        <Heading fontSize="2xl" fontWeight="700" color="white" mb={1} letterSpacing="-0.02em">
          Welcome back.
        </Heading>
        <Text fontSize="sm" color="whiteAlpha.500" mb={6} lineHeight={1.65}>
          impulz kept running while you were gone. This is your window to
          sync, flush, or gracefully pause before the browser shuts you down.
        </Text>

        {/* progress */}
        <Box mb={1}>
          <Flex justify="space-between" mb={2}>
            <Text fontFamily="mono" fontSize="xs" color="whiteAlpha.500">
              {currentLabel(progress)}
            </Text>
            <Text fontFamily="mono" fontSize="xs" color="whiteAlpha.300">
              {Math.round(progress)}%
            </Text>
          </Flex>
          <Box h="5px" bg="rgba(255,255,255,0.07)" borderRadius="full" overflow="hidden">
            <Box
              h="full"
              borderRadius="full"
              bg="linear-gradient(90deg, #16a34a, #4ade80)"
              style={{ width: `${progress}%`, transition: 'width 0.05s linear' }}
            />
          </Box>
          {/* step markers */}
          <Flex justify="space-between" mt={1}>
            {STEPS.map(s => (
              <Text key={s.from} fontFamily="mono" fontSize="9px" color="whiteAlpha.200">
                {s.from}%
              </Text>
            ))}
          </Flex>
        </Box>

        {/* quality note */}
        <Box
          mt={5}
          px={3} py={2}
          bg="rgba(239,68,68,0.07)"
          border="1px solid rgba(239,68,68,0.15)"
          borderRadius="lg"
        >
          <Text fontSize="xs" color="rgba(239,68,68,0.8)" fontFamily="mono">
            ↓ Quality auto-set to LOW while hidden — restores when FPS stabilises
          </Text>
        </Box>

        {/* use cases */}
        <Box mt={5} pt={5} borderTop="1px solid rgba(255,255,255,0.06)">
          <Text fontSize="10px" letterSpacing="0.15em" textTransform="uppercase" color="whiteAlpha.300" fontFamily="mono" mb={3}>
            What you can do with this moment
          </Text>
          <Flex direction="column" gap={2}>
            {USE_CASES.map(u => (
              <Flex key={u.text} align="flex-start" gap={3}>
                <Text fontSize="sm" flexShrink={0}>{u.icon}</Text>
                <Text fontSize="xs" color="whiteAlpha.500" lineHeight={1.6}>{u.text}</Text>
              </Flex>
            ))}
          </Flex>
        </Box>

      </Box>

      <style>{`
        @keyframes pulse-dot {
          0%,100% { opacity:1; transform:scale(1); }
          50%      { opacity:0.4; transform:scale(0.6); }
        }
      `}</style>
    </Box>
  )
}
