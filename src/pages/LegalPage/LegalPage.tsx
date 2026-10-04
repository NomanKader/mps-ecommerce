import { Box, Button, Container, Stack, Typography } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';

import { storefrontColors } from '@app/providers/theme/tokens';
import { routePaths } from '@routes/routePaths';

const legalPages = {
  privacy: {
    title: 'Privacy Policy',
    updated: 'October 5, 2026',
    intro:
      "This Privacy Policy explains how AV's Store collects, uses, and protects customer information when you browse, create an account, place orders, use wallet features, or contact support.",
    sections: [
      {
        title: 'Information We Collect',
        items: [
          'Account details such as name, email address, phone number, and login information.',
          'Delivery information such as address, region, township, and order instructions.',
          'Order, payment, wallet, promotion, and customer support history.',
          'Basic technical information needed to keep the website secure and working correctly.',
        ],
      },
      {
        title: 'How We Use Information',
        items: [
          'To create and manage customer accounts.',
          'To process orders, delivery, payments, refunds, wallet top-ups, and customer service requests.',
          'To notify customers about order updates, payment status, promotions, or service changes.',
          'To improve product availability, store operations, website reliability, and customer experience.',
        ],
      },
      {
        title: 'Sharing and Protection',
        items: [
          'Customer information is used for AV’s Store operations and is not sold to third parties.',
          'Information may be shared with service providers only when needed for payment processing, delivery, hosting, communication, or legal compliance.',
          'AV’s Store uses reasonable safeguards to protect customer information from unauthorized access or misuse.',
        ],
      },
      {
        title: 'Customer Choices',
        items: [
          'Customers can update account profile and address details from their account area.',
          'Customers can contact support to request help with account, order, wallet, or privacy questions.',
          'Some information may need to be retained for order records, accounting, security, or legal reasons.',
        ],
      },
    ],
  },
  terms: {
    title: 'Terms & Conditions',
    updated: 'October 5, 2026',
    intro:
      "These Terms & Conditions explain the basic rules for using AV's Store, placing orders, using delivery services, payments, promotions, and wallet features.",
    sections: [
      {
        title: 'Using AV’s Store',
        items: [
          'Customers should provide accurate account, contact, delivery, and payment information.',
          'AV’s Store may update product availability, prices, promotions, delivery coverage, and service features from time to time.',
          'The service is currently focused on Yangon delivery. Orders outside supported delivery areas may be declined or delayed.',
        ],
      },
      {
        title: 'Orders and Delivery',
        items: [
          'Order acceptance depends on product availability, payment confirmation, delivery coverage, and operational capacity.',
          'Delivery times are estimates and may change due to weather, traffic, address issues, product availability, or other operational reasons.',
          'Customers should check order details before confirming checkout and be available at the delivery contact number.',
        ],
      },
      {
        title: 'Payments, Wallet, and Promotions',
        items: [
          'Available payment methods may include wallet, online payment gateway, cash on delivery, or other methods shown at checkout.',
          'Wallet top-ups and wallet usage are also subject to AV’s Store Wallet Terms & Conditions.',
          'Promo codes and discounts may have eligibility rules, usage limits, validity dates, and minimum order requirements.',
        ],
      },
      {
        title: 'Refunds and Order Issues',
        items: [
          'Refunds, replacements, or adjustments are reviewed based on the order issue, product condition, payment method, and support review.',
          'Customers should contact AV’s Store support as soon as possible for missing, damaged, incorrect, or payment-related issues.',
          'AV’s Store may request order details, photos, payment references, or other information to review a support request.',
        ],
      },
      {
        title: 'Support and Changes',
        items: [
          'For help, contact support@avsstoreonline.com or call +95-9953055682.',
          'AV’s Store may update these terms when services, payment options, delivery rules, or legal requirements change.',
        ],
      },
    ],
  },
};

export const LegalPage = () => {
  const { pathname } = useLocation();
  const page = pathname === routePaths.privacyPolicy ? legalPages.privacy : legalPages.terms;

  return (
    <Container sx={{ py: { md: 6, xs: 3 } }}>
      <Stack spacing={3} sx={{ maxWidth: 980 }}>
        <Box>
          <Typography sx={{ color: storefrontColors.navy, fontWeight: 900 }} variant="h3">
            {page.title}
          </Typography>
          <Typography sx={{ color: storefrontColors.muted, fontWeight: 700, mt: 1 }}>
            Last updated: {page.updated}
          </Typography>
        </Box>

        <Box
          sx={{
            backgroundColor: '#ffffff',
            border: `1px solid ${storefrontColors.border}`,
            borderRadius: 1,
            p: { md: 3, xs: 2 },
          }}
        >
          <Stack spacing={2.5}>
            <Typography sx={{ color: '#4f535b', fontWeight: 700, lineHeight: 1.7 }}>
              {page.intro}
            </Typography>

            {page.sections.map((section) => (
              <Box key={section.title}>
                <Typography
                  sx={{ color: storefrontColors.navy, fontSize: '1.1rem', fontWeight: 900 }}
                >
                  {section.title}
                </Typography>
                <Stack component="ul" spacing={1} sx={{ color: '#4f535b', m: 0, mt: 1, pl: 2.5 }}>
                  {section.items.map((item) => (
                    <Typography component="li" key={item} sx={{ fontWeight: 700, lineHeight: 1.65 }}>
                      {item}
                    </Typography>
                  ))}
                </Stack>
              </Box>
            ))}

            <Button
              component={Link}
              to={routePaths.home}
              sx={{
                alignSelf: 'flex-start',
                backgroundColor: storefrontColors.navy,
                borderRadius: 999,
                color: '#ffffff',
                fontWeight: 900,
                px: 3.5,
                py: 1.1,
                textTransform: 'none',
                '&:hover': { backgroundColor: storefrontColors.navyDark },
              }}
            >
              Back to home
            </Button>
          </Stack>
        </Box>
      </Stack>
    </Container>
  );
};
