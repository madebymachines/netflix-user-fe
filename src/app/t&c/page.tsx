"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import MobileShell from "@/components/MobileShell";
import Header from "@/components/Header";
import OverlayMenu from "@/components/OverlayMenu";

export default function TnCPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const prev = document.body.style.overflow;
    if (menuOpen) document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  const guestMenu = [
    { label: "Home", href: "/" },
    { label: "Sign In", href: "/sign-in" },
    { label: "Register", href: "/register" },
  ];

  return (
    <MobileShell
      header={<Header onMenu={() => setMenuOpen(true)} menuOpen={menuOpen} />}
    >
      <div className="absolute inset-0">
        <Image
          src="/images/ball.png"
          alt=""
          fill
          sizes="100vw"
          style={{ objectFit: "cover", objectPosition: "top" }}
          className="opacity-25"
          priority
        />
        <div className="absolute inset-0 bg-black/20" />
      </div>

      <div className="relative z-10 w-full px-4 pt-5 text-white">
        <h1 className="text-center text-[16px] font-extrabold tracking-wide">
          100PLUS PRO UNLOCK YOUR 100 CHALLENGE
        </h1>
        <h1 className="text-center text-[16px] font-extrabold tracking-wide mb-4">
          Terms and Conditions
        </h1>

        <div className="mx-auto w-full max-h-[460px] overflow-y-auto rounded-md border border-white/30 bg-black/30 p-4 leading-relaxed backdrop-blur-[2px] text-[12px] space-y-4">
          {/* Organiser */}
          <section>
            <h3 className="mb-2 font-bold">Organiser</h3>
            <p>F&amp;N Beverages Marketing Sdn. Bhd. (Co. No. 004594-A).</p>
          </section>

          {/* Campaign */}
          <section>
            <h3 className="mb-2 font-bold">Campaign</h3>
            <p>
              100PLUS PRO X PHYSICAL ASIA CAMPAIGN (
              <span className="font-bold">“Campaign”</span>).
            </p>
          </section>

          {/* Campaign Period */}
          <section>
            <h3 className="mb-2 font-bold">Campaign Period</h3>
            <p>
              The Campaign starts from 00:00:00, 01/11/2025 and ends on
              23:59:59, 31/01/2026 (
              <span className="font-bold">“Campaign Period”</span>). The
              Organiser reserves the right to change, cancel, terminate, or
              suspend the Campaign at any time during the Campaign Period
              without prior notice.
            </p>
          </section>

          {/* Eligibility */}
          <section>
            <h3 className="mb-2 font-bold">Eligibility</h3>
            <p>
              The Campaign is open to all individual legal residents of{" "}
              <span className="font-bold">MALAYSIA</span> aged eighteen (18) and
              above with a valid identification number at the time of
              participation during the Campaign Period, except employees and
              immediate family members of the Organiser, its affiliates,
              subsidiaries, advertising/PR agencies, and/or its suppliers.
            </p>
          </section>

          {/* Participation Method */}
          <section>
            <h3 className="mb-2 font-bold">Participation Method</h3>

            <ol className="list-decimal list-outside pl-5 space-y-4">
              {/* 1 */}
              <li>
                <p>
                  To participate in the Campaign, purchase a minimum of TWO (2)
                  bottles of 100PLUS (500ML each) (including a minimum of ONE
                  (1) bottle of 100PLUS PRO 500ML) (“Products”) in a single
                  original receipt (“Receipt”) from any outlets (in-store or
                  online store) (“Outlet”) in Malaysia during the Campaign
                  Period.
                </p>

                {/* In-Store (bagian dari item 1) */}
                <div className="mt-3 space-y-2">
                  <h4 className="font-bold">In-Store Purchase:</h4>
                  <p>
                    The Receipt shall come in the form of printed receipts from
                    the Outlet’s point-of-sale systems. The Receipt must be
                    legible and consist of the details of the Products
                    purchased, date of purchase, purchase amount, receipt
                    number, and the name and/or logo of the Outlet.
                  </p>
                </div>

                {/* Online (bagian dari item 1) */}
                <div className="mt-3 space-y-2">
                  <h4 className="font-bold">Online Purchase:</h4>
                  <ul className="list-disc list-outside pl-5 space-y-2">
                    <li>
                      The Receipt shall be in the form of a screenshot of the
                      invoice for online purchases made through any online
                      Outlet. The Receipt must bear the name and/or logo of the
                      online Outlet from which the online purchases were made.
                    </li>
                    <li>
                      The Receipt must also bear the date of purchase, products
                      purchased, purchase amount, payment date, order and/or
                      invoice number, and the name and/or logo of the online
                      Outlet.
                    </li>
                  </ul>
                </div>
              </li>

              {/* 2 */}
              <li>
                The Receipt as the proof of purchase is required for the
                Participants to participate in the Campaign. The Organiser does
                not accept any alteration of Receipt in any form. Handwritten
                Tax Invoice Receipt, Purchase Order, and/or Delivery Note will
                not be accepted.
              </li>

              {/* 3 */}
              <li>
                Participation in the Campaign is only available through the
                microsite at{" "}
                <a
                  href=" http://unlock100challenge.100plus.com.my/"
                  className="underline text-blue-400"
                >
                  http://unlock100challenge.100plus.com.my/
                </a>{" "}
                (“Microsite”).{" "}
                <span className="font-bold">
                  Each Receipt is ONLY eligible for one (1) entry via the
                  Microsite
                </span>
                .The Organiser reserves the right to disqualify any Receipt with
                incomplete details, or which is reprinted, duplicated,
                illegible, unclear, damaged, altered, modified, forged,
                falsified and/or in any forms that do not meet the requirements
                of the Campaign in the Organiser’s opinion. All Receipts that do
                not meet the requirements stated herein shall be disqualified by
                the Organiser without further notification to the Participants.
              </li>

              {/* 4 */}
              <li>
                Scan the QR CODE printed on the neck tag of 100PLUS PRO 500ML or
                various point-of-sale marketing materials or proceed to the
                Microsite to register your participation. Participants must
                first register for an account on the Microsite and complete the
                required data below, one time registration is only required per
                unique ID:
                <ul className="mt-2 list-disc list-outside pl-5 space-y-1">
                  <li>User Name</li>
                  <li>Email</li>
                </ul>
                <p className="mt-2">
                  <span className="font-bold">IMPORTANT NOTE:</span> In order to
                  participate in the Campaign, Participants need a compatible
                  device or a mobile device that can track their physical
                  movements (squats) and achievement. Participants must ensure
                  that their account can be synced to a compatible device or
                  mobile device upon successful registration.
                </p>
              </li>

              <li>
                After registering an account, participants are required to
                upload the Receipt to the Microsite for verification. In the
                event of unsuccessful verification, the participant will be
                disqualified and any challenge attempt by the participant will
                be disregarded.
              </li>

              <li>
                The Organiser will not be held liable in the event Participants
                are unable to register an account due to any reason whatsoever
                or after registration, they are unable to upload their Receipt
                or their device or mobile device fails to track physical
                movements (squats), cannot be synced or deemed incompatible with
                Microsite.
              </li>
            </ol>
          </section>

          {/* Participation in the challenge */}
          <section>
            <h3 className="mb-2 font-bold">Participation in the Challenge</h3>
            <ol className="list-decimal list-outside pl-5 space-y-2">
              <li>
                Participants may start to complete the challenge during the
                Campaign Period by using their device to record their challenge
                count and stand a chance to win Prizes.
              </li>
              <li>
                The challenge is to achieve as many Squats as possible in a
                100-second time frame.
              </li>
              <li>
                Participants must refresh their challenge and update data on the
                Microsite page to ensure that their progress is up to date.
              </li>
              <li>
                Participants’ ranking on the leaderboard may not reflect the
                final winners of the Campaign, as all results are subject to
                eligibility checks and verification by the Organiser to ensure
                compliance with the Campaign Terms and Conditions. Failure to
                comply will result in disqualification, regardless of
                leaderboard ranking.
              </li>
              <li>
                The Organiser may revise the challenge or mechanics at any time
                at its sole discretion, without prior notice and without
                liability.
              </li>
              <li>
                The Organiser reserves the right to forfeit any participation if
                the Participant(s) do not comply with the Campaign Terms and
                Conditions.
              </li>
              <li>
                By registering for and participating in the Campaign,
                participants acknowledge that the challenge involves physical
                activity that may include strenuous exercise. Each participant
                is solely responsible for evaluating their own health and
                fitness level and obtaining appropriate medical advice before
                taking part. By participating, they confirm that (i) they are
                fit to take part, and (ii) they voluntarily assume all risks and
                release the Organiser, its affiliates, and representatives from
                any liabilities to the maximum extent permitted by law.
              </li>
            </ol>
          </section>

          {/* Weekly Prizes */}
          <section>
            <h3 className="mb-2 font-bold">Weekly Prizes</h3>
            <p className="mb-2">
              There are twenty (20) Weekly Prizes each week for thirteen (13)
              consecutive weeks. Each Weekly Prize is a{" "}
              <span className="font-bold">100PLUS PRO KIT</span> worth RM150 and
              comprises one (1) duffle bag, one (1) gym towel, and one (1)
              100PLUS PRO t-shirt.
            </p>

            <p className="font-semibold mt-2">
              The Campaign is divided into thirteen (13) weekly periods as
              follows:
            </p>
            <ul className="list-disc list-outside pl-5 space-y-1">
              <li>Week 1: 00:00:00, 01/11/2025 – 23:59:59, 07/11/2025</li>
              <li>Week 2: 00:00:00, 08/11/2025 – 23:59:59, 14/11/2025</li>
              <li>Week 3: 00:00:00, 15/11/2025 – 23:59:59, 21/11/2025</li>
              <li>Week 4: 00:00:00, 22/11/2025 – 23:59:59, 28/11/2025</li>
              <li>Week 5: 00:00:00, 29/11/2025 – 23:59:59, 05/12/2025</li>
              <li>Week 6: 00:00:00, 06/12/2025 – 23:59:59, 12/12/2025</li>
              <li>Week 7: 00:00:00, 13/12/2025 – 23:59:59, 19/12/2025</li>
              <li>Week 8: 00:00:00, 20/12/2025 – 23:59:59, 26/12/2025</li>
              <li>Week 9: 00:00:00, 27/12/2025 – 23:59:59, 02/01/2026</li>
              <li>Week 10: 00:00:00, 03/01/2026 – 23:59:59, 09/01/2026</li>
              <li>Week 11: 00:00:00, 10/01/2026 – 23:59:59, 16/01/2026</li>
              <li>Week 12: 00:00:00, 17/01/2026 – 23:59:59, 23/01/2026</li>
              <li>Week 13: 00:00:00, 24/01/2026 – 23:59:59, 31/01/2026</li>
            </ul>

            <p className="mt-2">
              At the end of each weekly period, squats are tabulated as{" "}
              <span className="font-bold">1 squat = 1 point</span>.
            </p>
            <p className="mt-2">
              Top twenty (20) participants each week (subject to verification)
              win the Weekly Prizes.
            </p>
            <p className="mt-2">
              A total of two hundred and sixty (260) Weekly Prizes are
              available. Each participant can win the Weekly Prize{" "}
              <span className="font-bold">once</span> throughout the Campaign
              Period.
            </p>
          </section>

          {/* Monthly Prizes */}
          <section>
            <h3 className="mb-2 font-bold">Monthly Prizes</h3>
            <p className="mb-2">
              There are five (5) Monthly Prizes each month for three (3) months.
              Each Monthly Prize is a
              <span className="font-bold">
                {" "}
                3-Month Dual Gym Membership (Fitness First/Celebrity Fitness)
              </span>
              worth RM1,800.00 for one person.
            </p>

            <p className="font-semibold mt-2">
              The following are the three (3) monthly periods:
            </p>
            <ul className="list-disc list-outside pl-5 space-y-1">
              <li>Month 1: 01/11/2025 – 30/11/2025</li>
              <li>Month 2: 01/12/2025 – 31/12/2025</li>
              <li>Month 3: 01/01/2026 – 31/01/2026</li>
            </ul>

            <p className="mt-2">
              At the end of each monthly period throughout the Campaign Period,
              the Organizer will tabulate each Participant’s total squats
              achieved. The squats will be tabulated as{" "}
              <span className="font-bold">1 squat = 1 point</span>.
            </p>
            <p className="mt-2">
              The top five (5) Participants with the highest number of squats
              for each monthly period will be eligible to win the 5 Monthly
              Prizes, subject to verification by the Organiser.
            </p>
            <p className="mt-2">
              There is a total of fifteen (15) Monthly Prizes to be won
              throughout the Campaign Period. These prizes shall be subject to
              the terms and conditions stipulated thereon.
            </p>
            <p className="mt-2">
              Each Participant is only entitled to win the Monthly Prize once
              throughout the Campaign Period.
            </p>
          </section>

          {/* Prizes Redemption */}
          <section>
            <h3 className="mb-2 font-bold">Prizes Redemption</h3>
            <ol className="list-decimal list-outside pl-5 space-y-2">
              <li>
                The Organiser will contact all the winners for fulfilment of
                weekly and monthly prizes via the email address provided during
                account registration.
              </li>
              <li>
                The Organiser will not be held liable in the event the winners
                cannot be contacted for whatever reasons.
              </li>
              <li>
                All Winners must provide personal details such as full name as
                per MyKad/ID, MyKad/ID number, delivery address for verification
                and prize redemption via email. Failure to provide the personal
                details will result in disqualification and prize forfeiture at
                the Organiser’s absolute discretion.
              </li>
              <li>
                Throughout the Campaign Period each Participant can only win a
                maximum of one (1) Weekly Prize and one (1) Monthly Prize.
              </li>
              <li>
                All Winners must provide their personal details to the Organiser
                for prizes fulfilment, without which the Organiser may not be
                able to fulfill such prizes. The Organiser reserves the rights
                to forfeit their Prizes if the Winners fail to provide their
                full details upon request. The Organiser reserves the right to
                disqualify any participation or Prize if a Participant or
                Winner’s personal details (including full name, identification
                number and mobile number) are found at any time to be inaccurate
                or wrong.
              </li>
              <li>
                All Weekly and Monthly Prize Winners will be contacted by the
                Organiser for Prizes fulfilment via the email address submitted
                to the Organiser during account registration within five (5) to
                seven (7) working days from the confirmation of the Winners by
                the Organiser.
              </li>
              <li>
                The Organiser reserves the rights to extend the timelines stated
                under this clause owing to any reasons beyond the control of the
                Organiser at no compensation to the winners.
              </li>
              <li>
                All Winners must abide by the terms and conditions of the
                party(ies) arranging and/or providing the prizes. The Organiser
                reserves the right to forfeit their Prizes in the event that the
                Winner(s) do not comply with the Campaign Terms and Conditions
                and Prizes Terms and Conditions.
              </li>
              <li>
                The Organiser makes no warranties or representations whatsoever
                with respect to the Prizes and shall not be responsible or
                liable for any problems and/or damage thereto or arising
                therefrom.
              </li>
              <li>
                The Winners Result Ads will be featured on the Organiser’s
                Website at:{" "}
                <a
                  href="https://www.fn.com.my/Contests-contests/"
                  className="underline text-blue-400"
                >
                  https://www.fn.com.my/Contests-contests/
                </a>
              </li>
              <li>
                Prizes must be claimed within one (1) month from the date of
                announcement of winners or notice of Prize claim, whichever is
                earlier. Failure to do so will result in disqualification and
                forfeiture of the Prize.
              </li>
            </ol>
          </section>

          {/* Challenge Deadline */}
          <section>
            <h3 className="mb-2 font-bold">Challenge Deadline</h3>
            <p>
              All participation in the challenge must be completed on or before
              23:59:59, 31/01/2026. Any challenge attempts after the end of the
              Campaign Period will be automatically disqualified.
            </p>
          </section>

          {/* Liability, Responsibility and Rights */}
          <section>
            <h3 className="mb-2 font-bold">
              Liability, Responsibility and Rights of the Organiser
            </h3>
            <ol className="list-decimal list-outside pl-5 space-y-2">
              <li>
                The pictures of the prizes shown on the Campaign materials are
                for illustration purposes only. Actual prizes may vary. The
                prizes will be subjected to the Prize Redemption Terms and
                Conditions that will be attached to the prizes and stated in the
                winner acknowledgement letters. Prize values reflected are
                accurate at the time of printing.
              </li>
              <li>
                Prize redemption is subject to the availability of the prizes,
                which will be announced by the Organiser from time to time. The
                Organiser reserves the right to substitute any of the prizes
                with that of similar value, at any time without prior notice at
                its absolute discretion.
              </li>
              <li>
                Winners must take the Prizes on an “as is” basis. The prizes are
                not transferable, non-refundable and/or non-exchangeable for
                cash, credit and/or other items or voucher in part or in full.
                The Organiser will not entertain any complaints on the quality
                and quantity of the prizes after the prize has been collected by
                or delivered to the winner.
              </li>
              <li>
                The Organiser shall not be liable in the event the prize(s) are
                lost, spoilt, damaged or stolen during or after the delivery or
                collection of the prize(s). Any additional costs (including but
                not limited to, travel expenses and applicable taxes) arising
                from or associated with the redemption or collection of the
                prizes are to be borne solely by the winner.
              </li>
              <li>
                By participating in this Campaign, all Participants agree to
                unconditionally assume full liability and responsibility to the
                extent permitted by law in the event of any loss, mishap,
                injury, damage, claim, or accidents (including death) suffered
                as a result of their participation in this Campaign, redemption
                and/or utilisation of the prizes and agree to release and hold
                the Organiser free and harmless from any liabilities.
              </li>
              <li>
                The Organiser reserves the right to cancel, terminate and/or
                suspend the Campaign at any time, without prior notice.
              </li>
              <li>
                The Organiser reserves the right to forfeit any participation if
                the Participant(s) do not comply with the Campaign’s Terms and
                Conditions.
              </li>
              <li>
                The Organiser’s decision on all matters relating to the Campaign
                is final, conclusive, and binding. No correspondence or appeal
                will be entertained.
              </li>
              <li>
                Participation in the Contest and/or acceptance of any prize(s)
                constitutes an irrevocable permission and consent from the
                participants for the Organiser to use their personal details,
                audio and/or video recordings, and photographs for the purposes
                of publicity and advertisement without any compensation or need
                for prior notification to the Participants.
              </li>
              <li>
                The Organiser may at its sole and absolute discretion amend the
                Terms and Conditions set out herein from time to time, without
                any prior notice. The Organiser reserves the rights to alter,
                cancel, terminate or suspend the Campaign, mechanism of the
                Campaign, the prizes and/or any part thereof without any prior
                notice. For the avoidance of doubt, the alteration,
                cancellation, termination or suspension by the Organiser of the
                prize, Campaign or any part thereof shall not entitle the
                Participants to any claim or compensation against the Organiser
                (in cash or in any kind) for any and all loss or damage suffered
                or incurred by the Participants whether as a direct or indirect
                result of the act of alteration, cancellation, termination or
                suspension.
              </li>
              <li>
                The Organiser excludes all its responsibilities and liabilities
                arising from any postponement, cancellation, delay or changes or
                modification to the Campaign or prizes or due to any other
                unforeseen circumstances beyond the Organiser’s control such as
                governmental interference, civil commotion, riot, war, strikes,
                act of God, act of terrorism (including but not limited to any
                act of violence, hostility, national emergency, occurrence of
                any epidemic/pandemic outbreaks) and for any act or default by
                any third-party suppliers or vendors.
              </li>
            </ol>
          </section>

          {/* PDPA Notice */}
          <section>
            <h3 className="mb-2 font-bold">
              Notice Under the Personal Data Protection Act 2010
            </h3>
            <p>
              This written notice (“Notice”) serves to inform you that your
              personal data is being processed by or on behalf of F&N Beverages
              Marketing Sdn Bhd (“F&N” or “we” or “us”). Further, by
              participating in this Campaign, you hereby consent to the
              processing of your personal data by F&N in the manner as specified
              in this Notice. We shall be processing your personal data that you
              have provided to us, including but not limited to, your name,
              national identity card number, contact number, address, audio
              and/or video recording, photograph, and any other information that
              we have requested from you for this Campaign. F&N will be
              processing your personal data, including any additional
              information you may subsequently provide to F&N, for the purposes
              of conducting this Campaign and contacting you (if necessary).
            </p>
            <p className="mt-2">
              The personal data that you provide us may be disclosed to and
              processed by our service providers only for the aforementioned
              purposes. You are responsible for ensuring that the personal data
              you provide us is accurate, complete and not misleading and that
              such personal data is up to date. You may access and request for
              the correction of your personal data and/or to limit the
              processing of your personal data or make any enquiries or
              complaints in respect of your personal data, by emailing our
              service provider at no reply@100plusglobal.com. In the event of
              any inconsistencies between the English version and the Bahasa
              Malaysia version of this Notice, the English version shall prevail
              over the Bahasa Malaysia version.
            </p>
            <p className="mt-2">
              The Organiser reserves the right to disqualify your participation
              in the event that you do not agree with or consent to the
              collection and/or processing of your personal data without any
              prior notice at its absolute discretion.
            </p>
          </section>

          {/* Other Terms */}
          <section>
            <h3 className="mb-2 font-bold">Other Terms</h3>
            <p>
              By participating in this Campaign, the Participants are taken to
              have read, understood and agreed to be bound by the Terms and
              Conditions of this Campaign, and accept that all decisions made by
              the Organiser shall be final and binding. The Organiser reserves
              the right to change, amend, add or delete any of the Campaign
              Terms and Conditions at any time without prior notice to the
              Participants and the Participants agree that their continued
              participation in the Campaign will constitute their acceptance of
              the revised Terms and Conditions.
            </p>
            <p className="mt-2">
              The Campaign’sTerms and Conditions are prepared in several
              languages. In the event of any inconsistencies between all the
              available versions, the English version on the website at:
              <a
                href="https://www.fn.com.my/Contests-contests/"
                className="underline text-blue-400"
              >
                https://www.fn.com.my/Contests-contests/
              </a>
              / shall prevail.
            </p>
            <p className="mt-2">
              For further inquiries about the Campaign, please visit our website
              at:{" "}
              <a
                href="https://www.fn.com.my/Contests-contests/"
                className="underline text-blue-400"
              >
                https://www.fn.com.my/Contests-contests/
              </a>
              .
            </p>
          </section>
        </div>

        <Link
          href="/register"
          className="mx-auto mt-4 block w-full rounded-md border border-white/30 bg-black/60 py-3 text-center font-bold"
        >
          Back to Sign Up
        </Link>
      </div>

      <OverlayMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        items={guestMenu}
      />
    </MobileShell>
  );
}
