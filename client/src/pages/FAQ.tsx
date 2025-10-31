import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HelpCircle } from "lucide-react";

export default function FAQ() {
  const faqs = [
    {
      category: "Getting Started",
      questions: [
        {
          q: "What is BNBall?",
          a: "BNBall is the first fully decentralized sports prediction market built on Binance Smart Chain. Users can create and participate in prediction markets for various sports events, with outcomes verified through Chainlink oracles and AI verification.",
        },
        {
          q: "How do I start using BNBall?",
          a: "Simply connect your Web3 wallet (MetaMask, Trust Wallet, etc.), fund it with BNB or BNBALL tokens, browse active markets, and place your predictions. All transactions are on-chain and transparent.",
        },
        {
          q: "What wallets are supported?",
          a: "BNBall supports all WalletConnect-compatible wallets including MetaMask, Trust Wallet, Binance Chain Wallet, and more. Any wallet that works with BSC will work with BNBall.",
        },
      ],
    },
    {
      category: "How It Works",
      questions: [
        {
          q: "How are prediction markets created?",
          a: "Anyone can create a prediction market by staking a small amount of BNBALL tokens. You define the event, deadline, and resolution criteria. Markets that attract betting activity earn the creator a small fee.",
        },
        {
          q: "How are results determined?",
          a: "We use a multi-layer verification system: (1) Chainlink oracles for objective sports data, (2) AI verification for complex scenarios, (3) Community governance for disputed outcomes. This ensures accuracy and prevents manipulation.",
        },
        {
          q: "What happens if there's a disputed result?",
          a: "If automated systems disagree or confidence is low, the market enters a 24-hour dispute period. BNBALL token holders can vote on the outcome, requiring a 51% majority. Voters are rewarded for participation.",
        },
        {
          q: "When do I receive my winnings?",
          a: "Winnings are distributed automatically within minutes of market resolution. Once the oracle confirms the outcome, smart contracts instantly pay winners proportionally based on the betting pool.",
        },
      ],
    },
    {
      category: "Tokens & Fees",
      questions: [
        {
          q: "What's the difference between BNB and BNBALL?",
          a: "BNB is the primary betting currency with instant liquidity. BNBALL is our platform utility token offering reduced platform fees, governance rights, and staking rewards. You can use either for betting.",
        },
        {
          q: "What are the platform fees?",
          a: "BNBall charges competitive platform fees that are automatically deducted from your bet. BNBALL token holders enjoy reduced fees. Market creators earn a small percentage of the total pool volume as an incentive to create quality markets.",
        },
        {
          q: "How can I earn BNBALL tokens?",
          a: "Earn BNBALL by: (1) Creating popular markets, (2) Staking BNB in liquidity pools, (3) Participating in governance votes, (4) Early adopter rewards, (5) Trading on DEXs like PancakeSwap.",
        },
        {
          q: "Can I stake BNBALL tokens?",
          a: "Yes! Stake BNBALL to earn a share of platform fees. The longer you stake, the higher your rewards multiplier. Staked tokens also carry additional voting weight in governance.",
        },
      ],
    },
    {
      category: "Security & Trust",
      questions: [
        {
          q: "Are my funds safe?",
          a: "All funds are held in audited smart contracts. We never have custody of your assets. The escrow vault contract is fully transparent and verifiable on BSCScan. Third-party security audits available in our docs.",
        },
        {
          q: "What if a game is cancelled or postponed?",
          a: "If an event is cancelled before completion, the smart contract automatically refunds all participants. For postponed events, the deadline automatically extends to the new scheduled time.",
        },
        {
          q: "Can the platform be manipulated?",
          a: "Our multi-layer oracle system makes manipulation extremely difficult. We use: (1) Decentralized Chainlink feeds, (2) Multiple data sources, (3) AI cross-verification, (4) Community oversight. No single entity can alter outcomes.",
        },
        {
          q: "Is BNBall audited?",
          a: "Yes, our smart contracts have been audited by leading blockchain security firms. Audit reports are publicly available. We also have a bug bounty program rewarding security researchers.",
        },
      ],
    },
    {
      category: "Markets & Betting",
      questions: [
        {
          q: "What sports can I bet on?",
          a: "Currently supporting NBA, NFL, FIFA, boxing, and major e-sports (LoL, Dota 2, CS:GO). We're continuously adding new sports based on community demand and oracle availability.",
        },
        {
          q: "What's the minimum bet amount?",
          a: "Minimum bet is 0.001 BNB to keep gas costs proportional. There's no maximum, but large bets will move the odds significantly due to the automated market maker mechanism.",
        },
        {
          q: "How are odds calculated?",
          a: "Odds are determined by an automated market maker (AMM) based on the ratio of YES vs NO bets. When you bet YES, YES odds decrease and NO odds increase, creating a balanced market.",
        },
        {
          q: "Can I cancel my bet?",
          a: "No, all bets are final once placed. This is enforced by the smart contract to ensure market integrity. Always double-check your prediction before confirming the transaction.",
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
              <HelpCircle className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to know about BNBall prediction markets
            </p>
          </div>

          <div className="space-y-8">
            {faqs.map((section, idx) => (
              <Card key={idx} className="p-6">
                <h2 className="text-2xl font-bold mb-4">{section.category}</h2>
                <Accordion type="single" collapsible className="w-full">
                  {section.questions.map((faq, faqIdx) => (
                    <AccordionItem key={faqIdx} value={`item-${idx}-${faqIdx}`}>
                      <AccordionTrigger className="text-left" data-testid={`faq-question-${idx}-${faqIdx}`}>
                        {faq.q}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground" data-testid={`faq-answer-${idx}-${faqIdx}`}>
                        {faq.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </Card>
            ))}
          </div>

          <Card className="mt-12 p-8 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
            <h3 className="text-xl font-bold mb-3">Still have questions?</h3>
            <p className="text-muted-foreground mb-6">
              Join our community on Telegram or Discord for real-time support from our team and experienced users.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button data-testid="button-join-telegram">Join Telegram</Button>
              <Button variant="outline" data-testid="button-join-discord">Join Discord</Button>
            </div>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}
