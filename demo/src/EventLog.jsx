import { Box, Flex, Text } from '@chakra-ui/react'

export function EventLog({ events }) {
  return (
    <Box>
      <Text
        fontSize="10px"
        letterSpacing="0.15em"
        textTransform="uppercase"
        color="whiteAlpha.400"
        fontFamily="mono"
        mb={3}
      >
        Live events
      </Text>
      <Box
        className="event-log-scroll"
        bg="rgba(0,0,0,0.4)"
        border="1px solid rgba(255,255,255,0.07)"
        borderRadius="xl"
        p={4}
        h="148px"
        overflowY="auto"
        fontFamily="mono"
        fontSize="xs"
      >
        {events.length === 0 ? (
          <Text color="whiteAlpha.300" py={1}>Waiting for events…</Text>
        ) : (
          events.map((e, i) => (
            <Flex
              key={i}
              gap={4}
              py="5px"
              borderBottom="1px solid rgba(255,255,255,0.04)"
              _last={{ borderBottom: 'none' }}
              lineHeight="1.4"
            >
              <Text color="whiteAlpha.300" flexShrink={0}>{e.time}</Text>
              <Text color={e.color ?? 'whiteAlpha.500'}>{e.message}</Text>
            </Flex>
          ))
        )}
      </Box>
    </Box>
  )
}
