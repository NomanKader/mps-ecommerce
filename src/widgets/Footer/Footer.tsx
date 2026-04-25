import FacebookRoundedIcon from '@mui/icons-material/FacebookRounded';
import InstagramIcon from '@mui/icons-material/Instagram';
import { Box, Container, Divider, Grid, Stack, Typography } from '@mui/material';

import { storefrontColors, storefrontGradients } from '@app/providers/theme/tokens';
import { footerLinkGroups, quickHighlights } from '@features/home/data/homePage.data';

export const Footer = () => (
  <Box component="footer" sx={{ mt: 8 }}>
    <Box sx={{ backgroundColor: '#edf1f7', py: 3 }}>
      <Container>
        <Grid container spacing={3}>
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
      </Container>
    </Box>

    <Box sx={{ background: storefrontGradients.footer, color: storefrontColors.surface, py: { md: 7, xs: 5 } }}>
      <Container>
        <Grid container spacing={4}>
          <Grid size={{ lg: 4, xs: 12 }}>
            <Typography sx={{ color: storefrontColors.accent, fontWeight: 800, maxWidth: 320 }} variant="h4">
              Premium product delivered, anywhere in the UAE
            </Typography>
            <Typography sx={{ lineHeight: 1.8, mt: 3, maxWidth: 460 }} variant="body1">
              With a clean storefront structure, reusable UI layers, and separated theme tokens, this homepage is now ready
              to scale into the rest of your commerce experience.
            </Typography>
          </Grid>

          {footerLinkGroups.map((group) => (
            <Grid key={group.id} size={{ lg: 2, md: 4, xs: 12 }}>
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

          <Grid size={{ lg: 2, md: 4, xs: 12 }}>
            <Typography sx={{ color: storefrontColors.accent, fontWeight: 800, mb: 2 }} variant="h5">
              Connect With Us
            </Typography>
            <Stack direction="row" spacing={1.5} sx={{ mb: 2.5 }}>
              <Box sx={{ border: '2px solid rgba(255,255,255,0.65)', borderRadius: '50%', p: 1 }}>
                <FacebookRoundedIcon />
              </Box>
              <Box sx={{ border: '2px solid rgba(255,255,255,0.65)', borderRadius: '50%', p: 1 }}>
                <InstagramIcon />
              </Box>
            </Stack>
            <Typography sx={{ fontWeight: 800, textDecoration: 'underline' }} variant="body1">
              800KIBSONS
            </Typography>
            <Typography sx={{ mt: 0.5 }} variant="body1">
              customercare@kibsons.com
            </Typography>
          </Grid>
        </Grid>

        <Divider sx={{ borderColor: 'rgba(255,255,255,0.16)', my: 4 }} />

        <Stack
          direction={{ md: 'row', xs: 'column' }}
          spacing={2}
          sx={{ color: '#d6def0', justifyContent: 'space-between' }}
        >
          <Typography variant="body2">Copyright © 2026 Kibsons International LLC. All rights reserved.</Typography>
          <Stack direction="row" spacing={3} sx={{ flexWrap: 'wrap' }}>
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
