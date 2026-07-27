import FacebookRoundedIcon from '@mui/icons-material/FacebookRounded';
import InstagramIcon from '@mui/icons-material/Instagram';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Container,
  Divider,
  Grid,
  Stack,
  Typography,
} from '@mui/material';

import { storefrontColors, storefrontGradients } from '@app/providers/theme/tokens';
import { footerLinkGroups, quickHighlights } from '@features/home/data/homePage.data';

export const Footer = () => (
  <Box component="footer" sx={{ minWidth: 0, mt: { md: 8, xs: 4 }, width: '100%' }}>
    <Box sx={{ backgroundColor: '#edf1f7', py: { md: 3, xs: 2 } }}>
      <Container>
        <Grid container spacing={3} sx={{ display: { md: 'flex', xs: 'none' } }}>
          {quickHighlights.map((highlight) => (
            <Grid key={highlight.id} size={{ lg: 2.4, md: 4, xs: 6 }}>
              <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                <Box
                  sx={{
                    alignItems: 'center',
                    backgroundColor: storefrontColors.success,
                    borderRadius: '50%',
                    color: storefrontColors.surface,
                    display: 'flex',
                    fontSize: 24,
                    height: 52,
                    justifyContent: 'center',
                    width: 52,
                  }}
                >
                  {highlight.icon}
                </Box>
                <Typography sx={{ color: storefrontColors.navy, fontWeight: 800 }} variant="subtitle1">
                  {highlight.label}
                </Typography>
              </Stack>
            </Grid>
          ))}
        </Grid>
        <Box
          sx={{
            display: { md: 'none', xs: 'grid' },
            gap: 1.25,
            gridAutoColumns: 'minmax(218px, 72vw)',
            gridAutoFlow: 'column',
            mx: -2,
            overflowX: 'auto',
            px: 2,
            scrollPaddingInline: 16,
            scrollSnapType: 'x mandatory',
            WebkitOverflowScrolling: 'touch',
            '&::-webkit-scrollbar': { display: 'none' },
          }}
        >
          {quickHighlights.map((highlight) => (
            <Stack
              direction="row"
              key={highlight.id}
              spacing={1.25}
              sx={{
                alignItems: 'center',
                backgroundColor: '#ffffff',
                borderRadius: 1.5,
                minHeight: 72,
                px: 1.5,
                scrollSnapAlign: 'start',
              }}
            >
              <Box
                sx={{
                  alignItems: 'center',
                  backgroundColor: storefrontColors.success,
                  borderRadius: '50%',
                  color: storefrontColors.surface,
                  display: 'flex',
                  flexShrink: 0,
                  fontSize: 21,
                  height: 44,
                  justifyContent: 'center',
                  width: 44,
                }}
              >
                {highlight.icon}
              </Box>
              <Typography
                sx={{ color: storefrontColors.navy, fontSize: '0.9rem', fontWeight: 800 }}
              >
                {highlight.label}
              </Typography>
            </Stack>
          ))}
        </Box>
      </Container>
    </Box>

    <Box
      sx={{
        background: storefrontGradients.footer,
        color: storefrontColors.surface,
        pb: {
          md: 7,
          xs: 'calc(40px + 72px + env(safe-area-inset-bottom, 0px))',
        },
        pt: { md: 7, xs: 5 },
      }}
    >
      <Container>
        <Grid container spacing={{ md: 4, xs: 2.5 }}>
          <Grid size={{ lg: 4, xs: 12 }}>
            <Typography
              sx={{
                color: storefrontColors.accent,
                fontSize: { md: undefined, xs: '1.55rem' },
                fontWeight: 800,
                maxWidth: { md: 320, xs: 340 },
                mx: { md: 0, xs: 'auto' },
                textAlign: { md: 'left', xs: 'center' },
              }}
              variant="h4"
            >
              Premium product delivered, anywhere in Myanmar
            </Typography>
            <Typography
              sx={{
                color: { xs: '#d6def0' },
                fontSize: { xs: '0.9rem' },
                lineHeight: { md: 1.8, xs: 1.6 },
                mt: { md: 3, xs: 1.5 },
                mx: { md: 0, xs: 'auto' },
                maxWidth: 460,
                textAlign: { md: 'left', xs: 'center' },
              }}
              variant="body1"
            >
              With a clean storefront structure, reusable UI layers, and separated theme tokens, this homepage is now ready
              to scale into the rest of your commerce experience.
            </Typography>
          </Grid>

          {footerLinkGroups.map((group) => (
            <Grid
              key={group.id}
              size={{ lg: 2, md: 4, xs: 12 }}
              sx={{ display: { md: 'block', xs: 'none' } }}
            >
              <Typography sx={{ fontWeight: 800, mb: 2 }} variant="h5">
                {group.title}
              </Typography>
              <Stack spacing={1.25}>
                {group.links.map((link) => (
                  <Typography key={link} sx={{ color: '#d6def0' }} variant="body1">
                    {link}
                  </Typography>
                ))}
              </Stack>
            </Grid>
          ))}

          <Grid size={{ xs: 12 }} sx={{ display: { md: 'none', xs: 'block' } }}>
            <Stack spacing={1}>
              {footerLinkGroups.map((group) => (
                <Accordion
                  disableGutters
                  elevation={0}
                  key={group.id}
                  sx={{
                    backgroundColor: 'rgba(255,255,255,0.07)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: '10px !important',
                    color: storefrontColors.surface,
                    overflow: 'hidden',
                    '&::before': { display: 'none' },
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreRoundedIcon sx={{ color: storefrontColors.accent }} />}
                    sx={{
                      minHeight: 52,
                      px: 1.75,
                      '& .MuiAccordionSummary-content': { my: 1 },
                    }}
                  >
                    <Typography sx={{ fontSize: '0.98rem', fontWeight: 900 }}>
                      {group.title}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ pb: 1.75, pt: 0, px: 1.75 }}>
                    <Stack spacing={1.25}>
                      {group.links.map((link) => (
                        <Typography
                          key={link}
                          sx={{ color: '#d6def0', fontSize: '0.9rem', lineHeight: 1.4 }}
                        >
                          {link}
                        </Typography>
                      ))}
                    </Stack>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Stack>
          </Grid>

          <Grid
            size={{ lg: 2, md: 4, xs: 12 }}
            sx={{ textAlign: { md: 'left', xs: 'center' } }}
          >
            <Typography
              sx={{ color: storefrontColors.accent, fontWeight: 800, mb: 2 }}
              variant="h5"
            >
              Connect With Us
            </Typography>
            <Stack
              direction="row"
              spacing={1.5}
              sx={{ justifyContent: { md: 'flex-start', xs: 'center' }, mb: 2.5 }}
            >
              <Box sx={{ border: '2px solid rgba(255,255,255,0.65)', borderRadius: '50%', p: 1 }}>
                <FacebookRoundedIcon />
              </Box>
              <Box sx={{ border: '2px solid rgba(255,255,255,0.65)', borderRadius: '50%', p: 1 }}>
                <InstagramIcon />
              </Box>
            </Stack>
            <Typography sx={{ fontWeight: 800, textDecoration: 'underline' }} variant="body1">
              800AVS
            </Typography>
            <Typography sx={{ mt: 0.5 }} variant="body1">
              support@avsstoreonline.com
            </Typography>
          </Grid>
        </Grid>

        <Divider sx={{ borderColor: 'rgba(255,255,255,0.16)', my: { md: 4, xs: 3 } }} />

        <Stack
          direction={{ md: 'row', xs: 'column' }}
          spacing={{ md: 2, xs: 1.5 }}
          sx={{
            alignItems: { xs: 'center' },
            color: '#d6def0',
            justifyContent: 'space-between',
            textAlign: { xs: 'center' },
          }}
        >
          <Typography variant="body2">Copyright © 2026 AV's Store. All rights reserved.</Typography>
          <Stack
            direction="row"
            sx={{
              columnGap: { md: 3, xs: 2 },
              flexWrap: 'wrap',
              justifyContent: { xs: 'center' },
              rowGap: 1,
            }}
          >
            <Typography variant="body2">Locate Us</Typography>
            <Typography variant="body2">Become a supplier</Typography>
            <Typography variant="body2">Privacy Policy</Typography>
            <Typography variant="body2">Terms & Conditions</Typography>
          </Stack>
        </Stack>
      </Container>
    </Box>
  </Box>
);
