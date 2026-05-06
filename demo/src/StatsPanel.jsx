import { Box, Flex, Text } from '@chakra-ui/react'

function StatCard({ label, value, color }) {
  return (
    <Box
      flex={1}
      bg="rgba(255,255,255,0.03)"
      border="1px solid rgba(255,255,255,0.07)"
      borderRadius="xl"
      p={5}
    >
      <Text
        fontSize="10px"
        letterSpacing="0.15em"
        textTransform="uppercase"
        color="whiteAlpha.400"
        fontFamily="mono"
        mb={3}
      >
        {label}
      </Text>
      <Text
        fontSize="3xl"
        fontWeight="700"
        fontFamily="mono"
        color={color}
        lineHeight={1}
        transition="color 0.3s ease"
      >
        {value ?? '—'}
      </Text>
    </Box>
  )
}

export function StatsPanel({ fps, visible, idle, quality, particleCount }) {
  const fpsColor =
    fps == null       ? 'rgba(255,255,255,0.2)' :
    fps >= 70         ? '#4ade80' :
    fps >= 40         ? '#f59e0b' : '#ef4444'

  return (
    <Flex gap={3} flexWrap="wrap">
      <StatCard label="FPS" value={fps} color={fpsColor} />
      <StatCard
        label="Quality"
        value={quality?.toUpperCase()}
        color={quality === 'high' ? '#4ade80' : '#ef4444'}
      />
      <StatCard
        label="Tab"
        value={visible ? 'VISIBLE' : 'HIDDEN'}
        color={visible ? '#4ade80' : '#ef4444'}
      />
      <StatCard
        label="Idle"
        value={idle ? 'IDLE' : 'ACTIVE'}
        color={idle ? '#f59e0b' : '#4ade80'}
      />
      <StatCard
        label="Particles"
        value={particleCount}
        color="rgba(255,255,255,0.6)"
      />
    </Flex>
  )
}
