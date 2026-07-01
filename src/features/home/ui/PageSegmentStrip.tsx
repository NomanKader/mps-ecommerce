import { Box, Button, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Link } from 'react-router-dom';

import { storefrontColors } from '@app/providers/theme/tokens';
import { routePaths } from '@routes/routePaths';
import { storefrontMutedPanelSx } from '@shared/styles/storefront';
import type { StorefrontPageSegment } from '@features/home/types/home.types';

const pageSegmentAccentColors = ['#9aaa4f', '#168a9a', '#965036', '#cf8098', '#d62331'];

const getPageSegmentPath = (segment: StorefrontPageSegment) =>
  routePaths.pageSegmentDetails.replace(':segmentId', segment.id);

export const PageSegmentStrip = ({ segments }: { segments: StorefrontPageSegment[] }) => {
  if (!segments.length) return null;

  const isFullImageCardDesign = segments[0]?.displaySlot === 'after-storefront-icons';

  return (
    <Box sx={{ ...storefrontMutedPanelSx, p: { md: 3, xs: 2 } }}>
      <Box
        sx={{
          columnGap: 2,
          display: 'grid',
          gridTemplateColumns: {
            lg: isFullImageCardDesign
              ? 'repeat(5, minmax(0, 1fr))'
              : `repeat(${Math.min(Math.max(segments.length, 1), 3)}, minmax(0, 1fr))`,
            md: isFullImageCardDesign ? 'repeat(3, minmax(0, 1fr))' : 'repeat(3, minmax(0, 1fr))',
            xs: isFullImageCardDesign
              ? `repeat(${Math.max(segments.length, 1)}, minmax(276px, 78vw))`
              : 'repeat(auto-fit, minmax(260px, 1fr))',
          },
          overflowX: { md: 'visible', xs: isFullImageCardDesign ? 'auto' : 'visible' },
          pb: { md: 0, xs: isFullImageCardDesign ? 1 : 0 },
          rowGap: 2,
          scrollPaddingLeft: 16,
          scrollSnapType: { md: 'none', xs: isFullImageCardDesign ? 'x proximity' : 'none' },
          WebkitOverflowScrolling: 'touch',
          '&::-webkit-scrollbar': {
            height: 8,
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: alpha(storefrontColors.navy, 0.18),
            borderRadius: 999,
          },
        }}
      >
        {segments.map((segment, segmentIndex) => {
          const mediaItems = [
            ...segment.topCarousel,
            ...segment.afterNewProductsCarousel,
            ...segment.haveYouSeenCards,
          ].filter((item) => item.imageUrl || item.text);
          const accent =
            pageSegmentAccentColors[segmentIndex % pageSegmentAccentColors.length] ??
            storefrontColors.navy;

          return (
            <Box
              component={Link}
              key={segment.id}
              sx={{
                backgroundColor: storefrontColors.surface,
                border: `1px solid ${alpha(accent, 0.12)}`,
                borderRadius: isFullImageCardDesign ? 1.25 : 1,
                color: 'inherit',
                display: isFullImageCardDesign ? 'flex' : 'grid',
                flexDirection: isFullImageCardDesign ? 'column' : undefined,
                gridTemplateColumns:
                  segment.displaySlot === 'after-new-in-season'
                    ? { sm: '132px minmax(0, 1fr)', xs: '1fr' }
                    : '1fr',
                minHeight: isFullImageCardDesign ? 248 : 180,
                minWidth: 0,
                overflow: 'hidden',
                scrollSnapAlign: 'start',
                textDecoration: 'none',
              }}
              to={getPageSegmentPath(segment)}
            >
              {segment.imageUrl ? (
                <Box
                  alt={segment.title}
                  component="img"
                  loading="lazy"
                  src={segment.imageUrl}
                  sx={{
                    display: 'block',
                    flexShrink: 0,
                    height: isFullImageCardDesign ? { sm: 138, xs: 158 } : '100%',
                    minHeight: isFullImageCardDesign
                      ? undefined
                      : segment.displaySlot === 'after-new-in-season'
                        ? 180
                        : 220,
                    objectFit: 'cover',
                    width: '100%',
                  }}
                />
              ) : (
                <Box
                  sx={{
                    alignItems: 'center',
                    backgroundColor: alpha(storefrontColors.navy, 0.06),
                    color: storefrontColors.navy,
                    display: 'flex',
                    flexShrink: 0,
                    fontSize: '2rem',
                    justifyContent: 'center',
                    minHeight: isFullImageCardDesign
                      ? { sm: 138, xs: 158 }
                      : segment.displaySlot === 'after-new-in-season'
                        ? 180
                        : 220,
                  }}
                >
                  {segment.icon || '✦'}
                </Box>
              )}
              <Stack
                spacing={1.25}
                sx={{
                  background: isFullImageCardDesign
                    ? `linear-gradient(180deg, ${alpha(accent, 0.96)} 0%, ${accent} 100%)`
                    : 'transparent',
                  color: isFullImageCardDesign ? '#fff' : 'inherit',
                  flexGrow: 1,
                  justifyContent: isFullImageCardDesign ? 'space-between' : 'center',
                  p: isFullImageCardDesign ? { sm: 1.7, xs: 1.35 } : { md: 2, xs: 1.5 },
                }}
              >
                {segment.displaySlot === 'after-new-in-season' ? (
                  <Typography sx={{ fontSize: '1.75rem', lineHeight: 1 }}>
                    {segment.icon}
                  </Typography>
                ) : null}
                <Typography
                  sx={{
                    color: isFullImageCardDesign ? '#fff' : storefrontColors.navy,
                    fontSize: isFullImageCardDesign ? { sm: '0.95rem', xs: '0.88rem' } : undefined,
                    fontWeight: isFullImageCardDesign ? 800 : 900,
                    lineHeight: 1.15,
                    maxWidth: isFullImageCardDesign ? 180 : undefined,
                  }}
                  variant={isFullImageCardDesign ? 'h6' : 'h5'}
                >
                  {segment.title}
                </Typography>
                {isFullImageCardDesign ? (
                  <Button
                    component="span"
                    size="small"
                    sx={{
                      alignSelf: 'flex-start',
                      backgroundColor: storefrontColors.surface,
                      borderRadius: 1,
                      boxShadow: `0 8px 18px ${alpha('#9f1714', 0.14)}`,
                      color: storefrontColors.navy,
                      fontSize: { sm: '0.78rem', xs: '0.74rem' },
                      fontWeight: 800,
                      minWidth: 'auto',
                      px: 1.25,
                      py: 0.5,
                      textTransform: 'none',
                      '&:hover': { backgroundColor: '#eef3ff' },
                    }}
                    tabIndex={-1}
                  >
                    Shop now
                  </Button>
                ) : (
                  mediaItems.slice(0, 3).map((item, index) => (
                    <Typography color={storefrontColors.muted} key={index} variant="body2">
                      {item.text || `Featured item ${index + 1}`}
                    </Typography>
                  ))
                )}
              </Stack>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};
