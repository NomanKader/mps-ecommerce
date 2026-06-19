import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined';
import RestaurantOutlinedIcon from '@mui/icons-material/RestaurantOutlined';
import SpaOutlinedIcon from '@mui/icons-material/SpaOutlined';
import VolunteerActivismOutlinedIcon from '@mui/icons-material/VolunteerActivismOutlined';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import { Box, Button, Stack, Typography, type SvgIconProps } from '@mui/material';
import { alpha } from '@mui/material/styles';
import type { ElementType } from 'react';
import { Link, useLocation } from 'react-router-dom';

import { storefrontColors } from '@app/providers/theme/tokens';
import { routePaths } from '@routes/routePaths';

type SustainabilityPageConfig = {
  body: string[];
  eyebrow: string;
  highlights: string[];
  icon: ElementType<SvgIconProps>;
  path: string;
  title: string;
};

const sustainabilityPages: [SustainabilityPageConfig, ...SustainabilityPageConfig[]] = [
  {
    body: [
      "AV's Store was built to make everyday grocery shopping simpler for Myanmar households. The owner started with a practical idea: customers should be able to find fresh food, trusted pantry items, and household essentials in one dependable place.",
      'The store focuses on useful service, clear product choices, and consistent delivery standards so customers can shop with confidence whether they are buying for today, the week, or a family event.',
    ],
    eyebrow: 'Who we are',
    highlights: ['Family grocery roots', 'Fresh daily essentials', 'Customer-first service'],
    icon: ReceiptLongOutlinedIcon,
    path: routePaths.sustainability.story,
    title: 'Our Story',
  },
  {
    body: [
      "Our vision is to become a trusted grocery partner for customers who want quality, convenience, and fair value without losing the care of a local store.",
      'The owner wants AV’s Store to grow as a dependable shopping destination where fresh produce, prepared food ideas, partner brands, and home essentials are easy to discover.',
    ],
    eyebrow: 'Where we are going',
    highlights: ['Reliable shopping experience', 'Better access to quality products', 'Long-term customer trust'],
    icon: LightbulbOutlinedIcon,
    path: routePaths.sustainability.vision,
    title: 'Our Vision',
  },
  {
    body: [
      "AV's Store represents practical grocery service: clear categories, familiar products, responsive support, and a promise to treat every order with care.",
      'The brand is designed around everyday use. Customers should immediately understand what the store offers, how to shop, and why they can return again.',
    ],
    eyebrow: 'What we stand for',
    highlights: ['Simple store experience', 'Recognizable grocery categories', 'Consistent brand promise'],
    icon: SpaOutlinedIcon,
    path: routePaths.sustainability.brand,
    title: 'Our Brand',
  },
  {
    body: [
      "Quality means selecting products carefully, presenting them clearly, and preparing every order with attention before it reaches the customer.",
      'The store prioritizes freshness, practical packaging, and dependable fulfilment so customers receive items that match what they expected when ordering.',
    ],
    eyebrow: 'How we work',
    highlights: ['Freshness checks', 'Careful order handling', 'Dependable fulfilment'],
    icon: VolunteerActivismOutlinedIcon,
    path: routePaths.sustainability.quality,
    title: 'Quality',
  },
  {
    body: [
      "AV's Store Cares is about serving customers beyond a transaction. The owner’s goal is to build a grocery service that listens, helps, and improves with real customer needs.",
      'This includes clearer communication, better support, and a store experience that respects the time and trust customers give to AV’s Store.',
    ],
    eyebrow: 'How we care',
    highlights: ['Helpful support', 'Customer feedback', 'Community-minded service'],
    icon: FavoriteBorderRoundedIcon,
    path: routePaths.sustainability.cares,
    title: "AV's Store Cares",
  },
  {
    body: [
      "Media brings together store updates, announcements, product stories, and useful grocery information for customers.",
      'As the store grows, this section can share owner messages, campaign updates, partner news, and seasonal shopping ideas.',
    ],
    eyebrow: 'News and updates',
    highlights: ['Store announcements', 'Owner messages', 'Seasonal updates'],
    icon: LocalOfferOutlinedIcon,
    path: routePaths.sustainability.media,
    title: 'Media',
  },
  {
    body: [
      "Awards highlight recognition earned through service, product standards, customer trust, and business growth.",
      'This section is prepared for official milestones, certificates, partner recognition, and community acknowledgements as AV’s Store continues to develop.',
    ],
    eyebrow: 'Recognition',
    highlights: ['Store milestones', 'Service recognition', 'Partner acknowledgements'],
    icon: EmojiEventsOutlinedIcon,
    path: routePaths.sustainability.awards,
    title: 'Awards',
  },
  {
    body: [
      "AV's Store Kitchen helps customers turn grocery shopping into meals. It can feature prepared food ideas, home cooking inspiration, and practical recipes using products available in the store.",
      'The goal is to make shopping more useful by connecting ingredients, fresh items, and meal planning in one place.',
    ],
    eyebrow: 'Food inspiration',
    highlights: ['Recipe ideas', 'Prepared food inspiration', 'Easy meal planning'],
    icon: RestaurantOutlinedIcon,
    path: routePaths.sustainability.kitchen,
    title: "AV's Store Kitchen",
  },
];

const getActivePage = (pathname: string) =>
  sustainabilityPages.find((page) => page.path === pathname) ?? sustainabilityPages[0];

export const SustainabilityPage = () => {
  const { pathname } = useLocation();
  const activePage = getActivePage(pathname);
  const ActiveIcon = activePage.icon;

  return (
    <Box
      sx={{
        border: `1px solid ${storefrontColors.border}`,
        display: 'grid',
        gridTemplateColumns: { lg: '360px minmax(0, 1fr)', md: '310px minmax(0, 1fr)', xs: '1fr' },
        minHeight: { md: 720, xs: 'auto' },
      }}
    >
      <Box
        component="aside"
        sx={{
          borderRight: { md: `1px solid ${storefrontColors.border}`, xs: 0 },
          overflow: 'hidden',
        }}
      >
        <Box sx={{ backgroundColor: '#f3f4f9', px: 2, py: 1.5 }}>
          <Typography sx={{ color: storefrontColors.navy, fontSize: '1.22rem', fontWeight: 900, lineHeight: 1.15 }}>
            Sustainable Grocery Shopping
          </Typography>
        </Box>
        <Stack>
          {sustainabilityPages.map((page) => {
            const isActive = page.path === activePage.path;
            const Icon = page.icon;

            return (
              <Box
                component={Link}
                key={page.path}
                sx={{
                  alignItems: 'center',
                  backgroundColor: isActive ? '#f5f5f9' : '#ffffff',
                  color: isActive ? storefrontColors.navy : '#55565c',
                  display: 'flex',
                  gap: 2,
                  minHeight: 86,
                  px: 2.4,
                  textDecoration: 'none',
                  transition: 'background-color 160ms ease, color 160ms ease',
                  '&:hover': {
                    backgroundColor: '#f7f8fb',
                    color: storefrontColors.navy,
                  },
                }}
                to={page.path}
              >
                <Icon sx={{ color: '#d7a536', fontSize: 30, flexShrink: 0 }} />
                <Typography sx={{ fontSize: '1.07rem', fontWeight: isActive ? 900 : 800, lineHeight: 1.2 }}>
                  {page.title}
                </Typography>
              </Box>
            );
          })}
        </Stack>
      </Box>

      <Box component="main" sx={{ backgroundColor: '#fffdf9', minWidth: 0, p: { lg: 6, md: 4, xs: 2.4 } }}>
        <Box sx={{ maxWidth: 980 }}>
          <Stack direction={{ sm: 'row', xs: 'column' }} spacing={2.4} sx={{ alignItems: { sm: 'center', xs: 'flex-start' } }}>
            <Box
              sx={{
                alignItems: 'center',
                backgroundColor: alpha(storefrontColors.navy, 0.08),
                borderRadius: '50%',
                color: storefrontColors.navy,
                display: 'flex',
                flexShrink: 0,
                height: 86,
                justifyContent: 'center',
                width: 86,
              }}
            >
              <ActiveIcon sx={{ fontSize: 42 }} />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ color: '#d7a536', fontSize: '0.85rem', fontWeight: 900, letterSpacing: 0, textTransform: 'uppercase' }}>
                {activePage.eyebrow}
              </Typography>
              <Typography sx={{ color: storefrontColors.navy, fontSize: { md: '2.35rem', xs: '1.85rem' }, fontWeight: 900, lineHeight: 1.12, mt: 0.7 }}>
                {activePage.title}
              </Typography>
            </Box>
          </Stack>

          <Stack spacing={2.2} sx={{ mt: 4 }}>
            {activePage.body.map((paragraph) => (
              <Typography key={paragraph} sx={{ color: '#42464d', fontSize: { md: '1.12rem', xs: '1rem' }, fontWeight: 700, lineHeight: 1.75 }}>
                {paragraph}
              </Typography>
            ))}
          </Stack>

          <Box
            sx={{
              display: 'grid',
              gap: 1.5,
              gridTemplateColumns: { md: 'repeat(3, minmax(0, 1fr))', xs: '1fr' },
              mt: 4,
            }}
          >
            {activePage.highlights.map((highlight) => (
              <Box
                key={highlight}
                sx={{
                  backgroundColor: '#ffffff',
                  border: `1px solid ${storefrontColors.border}`,
                  borderRadius: 1,
                  px: 2,
                  py: 1.7,
                }}
              >
                <Typography sx={{ color: storefrontColors.navy, fontSize: '1rem', fontWeight: 900 }}>
                  {highlight}
                </Typography>
              </Box>
            ))}
          </Box>

          <Box sx={{ backgroundColor: '#ffffff', border: `1px solid ${storefrontColors.border}`, borderRadius: 1, mt: 4, p: { md: 3, xs: 2 } }}>
            <Typography sx={{ color: storefrontColors.navy, fontSize: '1.25rem', fontWeight: 900 }}>
              Message from the owner
            </Typography>
            <Typography sx={{ color: '#55565c', fontSize: '1.02rem', fontWeight: 700, lineHeight: 1.7, mt: 1.4 }}>
              AV's Store is here to serve customers with honest grocery choices, careful fulfilment, and a shopping experience that feels dependable every time.
            </Typography>
          </Box>

          <Button
            component={Link}
            sx={{
              backgroundColor: storefrontColors.navy,
              borderRadius: 999,
              color: '#ffffff',
              fontWeight: 900,
              mt: 4,
              px: 4,
              py: 1.25,
              textTransform: 'none',
              '&:hover': { backgroundColor: storefrontColors.navyDark },
            }}
            to={routePaths.catalog}
          >
            Start shopping
          </Button>
        </Box>
      </Box>
    </Box>
  );
};
