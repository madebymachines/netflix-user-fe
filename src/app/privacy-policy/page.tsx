"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import MobileShell from "@/components/MobileShell";
import Header from "@/components/Header";
import OverlayMenu from "@/components/OverlayMenu";

export default function PrivacyPolicyPage() {
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
        <h1 className="text-center text-[24px] font-extrabold tracking-wide mb-4">
          Privacy Policy
        </h1>

        <div className="mx-auto w-full border border-white/30 rounded-md bg-black/30 backdrop-blur-[2px] p-3 max-h-[460px] overflow-y-auto text-[12px] leading-relaxed">
          <div className="mb-4">
            <h3 className="font-bold mb-2">
              DATA PROTECTION AND PRIVACY STATEMENT
            </h3>
            <p className="mb-1">
              The purpose of this Data Protection and Privacy Statement is to
              inform you of how Fraser and Neave, Limited and its subsidiaries
              (collectively referred to as the “F&N Group”, “we”, “us” or
              “our”), manage Personal Data which is subject to the Singapore
              Personal Data Protection Act 2012.
            </p>
            <p className="mb-1">
              This Data Protection and Privacy Statement applies to all F&N
              Group websites (“Group Websites”), and sets out how we collect,
              use or disclose Personal Data from you or that you have provided
              to us through the Group Websites or otherwise.
            </p>
            <p className="mb-1">
              This Data Protection and Privacy Statement supplements but does
              not supersede or replace any other consents you may have provided
              to us in respect of your Personal Data and your consents herein
              are additional to any rights which the F&N Group may have to
              collect, use and disclose your Personal Data.
            </p>
            <p className="mb-1">
              By providing us with your Personal Data, whether through the Group
              Websites or otherwise, you consent, agree and accept that we, as
              well as our respective representatives and/or agents may collect,
              use, disclose and share among ourselves your Personal Data as
              described in this Data Protection and Privacy Statement.
            </p>
          </div>

          <div className="mb-4">
            <h3 className="font-bold mb-2">PERSONAL DATA</h3>
            <p className="mb-1">
              In this Data Protection and Privacy Statement, “Personal Data”
              refers to any data, whether true or not, about an individual who
              can be identified from that data or from that data in combination
              with other information, to which we may have access.
            </p>
            <p className="mb-1">
              Examples of such Personal Data you may provide to us include
              (depending on the nature of your interaction with us) your name,
              NRIC, passport or other identification number, telephone
              number(s), mailing address, email address and any other
              information relating to individuals which you have provided us in
              any form you may have submitted to us, or via any other form of
              interaction.
            </p>
          </div>

          <div className="mb-4">
            <h3 className="font-bold mb-2">COLLECTION OF PERSONAL DATA</h3>
            <p className="mb-1">
              Generally, we may collect Personal Data when you:
            </p>
            <ol className="list-decimal list-inside mb-1">
              <li>
                Visit Group Websites with a cookies-enabled browser or register
                a user account with Group Websites or use some of our website
                services and apps including establishing any online accounts
                with us;
              </li>
              <li>
                Conduct any online transactions (such as online shopping or
                making online purchases or bookings) on Group Websites or
                through our third party service providers, or such other service
                providers we may use from time to time;
              </li>
              <li>Download or use any of our mobile applications (apps); </li>
              <li>Apply to be a member of any of our programmes;</li>
              <li>
                Enter or respond to our promotions, initiatives or contests;
              </li>
              <li>
                Subscribe to our mailing lists for email subscription, postal
                promotions or phone or other forms of marketing (such as via
                telephone calls, messaging by SMS/ MMSs and WhatsApp);
              </li>
              <li>
                Interact with our representatives or customer service officers
                via telephone calls, letters, face to face meetings or emails or
                submit a comment, question or feedback to us using a “Contact
                Us” or similar feature on Group Websites, or contact us and
                disclose your Personal Data in any other way;{" "}
              </li>
              <li>
                Are informed of any changes to Group Websites, or our services,
                goods and/or products; and
              </li>
              <li>Submit your Personal Data to us for any other reasons.</li>
            </ol>

            <p className="mb-1">
              If you provide us with any Personal Data relating to any third
              party (e.g. information of your spouse, children and/or employees)
              for particular purposes, by submitting such information to us, you
              warrant and represent to us that you have obtained the consent of
              such third party to provide us with the Personal Data for the
              respective purposes.
            </p>
            <p className="mb-1">
              You should ensure that all Personal Data submitted to us is
              complete, accurate, true and correct. Failure by you or a relevant
              third party to do so may result in our inability to provide you
              with the products and services you have requested.
            </p>
          </div>

          <div className="mb-4">
            <h3 className="font-bold mb-2">HOW WE USE YOUR PERSONAL DATA</h3>
            <p className="mb-1">
              The F&N Group and our third party service providers as the case
              may be, may use your Personal Data:
            </p>
            <ol className="list-decimal list-inside mb-1">
              <li>
                To facilitate your access to Group Websites or the creation of
                your user account with Group Websites;
              </li>
              <li>
                To evaluate your preferences and for the maintenance of the
                Group Websites;
              </li>
              <li>To facilitate your online transactions;</li>
              <li>
                To register you as a member of any of our programmes and to
                provide you the benefits of such membership;
              </li>
              <li>
                To facilitate your participation in our promotions, initiatives
                or contests;
              </li>
              <li>
                To send you promotional and marketing material via email, post
                or telephone where appropriate;
              </li>
              <li>
                To answer your queries or provide you with assistance in any
                other way (including without limitation resolving complaints and
                handling requests); and
              </li>
              <li>
                To meet and comply with any applicable rules, laws, regulations,
                codes of practice or guidelines issued by any legal or
                regulatory body which are binding on us; and
              </li>
              <li>
                For purposes which are reasonably related to the aforesaid.
              </li>
            </ol>
          </div>

          <div className="mb-4">
            <h3 className="font-bold mb-2">HOW WE SHARE YOUR PERSONAL DATA</h3>
            <p className="mb-1">
              In order to provide the above services to you, we may share your
              Personal Data with the following entities:
            </p>
            <ol className="list-decimal list-inside mb-1">
              <li>Other entities of the F&N Group;</li>
              <li>
                Third-party vendors and service providers (such as
                subcontractors, agents or network operators) who are employed to
                perform business, support, operational and/or
              </li>
              <li>
                administrative functions such as marketing, payment, fulfillment
                and delivery of orders;
              </li>
              <li>
                Third parties with whom we conduct joint marketing and/or
                cross-promotions, including providing rewards or benefits; and
              </li>
              <li>Our professional advisers such as auditors and lawyers.</li>
            </ol>

            <p className="mb-1">
              Some of the above entities may be located outside of Singapore.
              Where this is the case, your Personal Data may be transferred
              overseas from time to time. Such transfers will be carried out in
              accordance with relevant data protection laws.
            </p>
            <p className="mb-1">
              Third parties are subject to confidentiality obligations and may
              only use your Personal Data to perform the necessary functions and
              not for other purposes.
            </p>
            <p className="mb-1">
              We may also disclose personal data as permitted or required by
              law.
            </p>
          </div>

          <div className="mb-4">
            <h3 className="font-bold mb-2">USE OF COOKIES</h3>
            <p className="mb-1">
              A cookie is a small piece of information that is placed on your
              Internet browsing software (the “browser”) by a website that you
              visit. It helps the website to remember information about your
              visit to make your next visit easier and the site more useful to
              you.
            </p>
            <p className="mb-1">
              We may use cookies on Group Websites for the following purposes:
            </p>
            <ol className="list-decimal list-inside mb-1">
              <li>
                To enable certain features and functions on Group Websites (e.g.
                remembering your user-ID, browsing and other product and/or
                service preferences)
              </li>
              <li>
                To identify the causes of problems arising at web servers and to
                resolve these problems or improve efficiency of Group Websites;
              </li>
              <li>
                To improve the contents of Group Websites and emails from us;
              </li>
              <li>
                To customize the contents of Group Websites and emails from us
                to suit your individual interests or purposes;{" "}
              </li>
              <li>
                To utilize your browsing history on Group Websites and the
                results of questionnaires for market research or marketing,
                including sending you advertisements via Group Websites;
              </li>
              <li>
                To obtain aggregated Group Website usage and visitation
                statistics;
              </li>
              <li>To administer services to you; and</li>
              <li>
                For purposes which are reasonably related to the aforesaid.
              </li>
            </ol>

            <p className="mb-1">
              You may reject the use of cookies on Group Websites by configuring
              your browser to disable the use of cookies. However, this may
              result in the loss of functionality which may restrict your use of
              Group Websites and/or delay or affect the way in which it
              operates. If you disable the use of cookies, you may no longer be
              able to receive personalized features of Group Websites, which
              rely on the use of cookies.
            </p>
          </div>

          <div className="mb-4">
            <h3 className="font-bold mb-2">LINKS TO THIRD PARTY WEBSITES</h3>
            <p className="mb-1">
              Group Websites may contain links to other third party websites and
              microsites, whose privacy practices may differ from ours. If you
              submit Personal Data to any of those sites, your Personal Data is
              not subject to this Privacy Statement.
            </p>
            <p className="mb-1">
              We encourage you to review the privacy statement of any site you
              visit. By clicking on or activating such links and leaving Group
              Websites, we can no longer exercise control over any data or
              information which you give to any other entity after leaving Group
              Websites. Any access to such other sites or pages is therefore
              entirely at your own risk. We are not responsible for the Personal
              Data policies (including Personal Data protection and cookies),
              content or security of any third party websites linked to or from
              Group Websites.
            </p>
          </div>

          <div className="mb-4">
            <h3 className="font-bold mb-2">RETENTION OF INFORMATION</h3>
            <p className="mb-1">
              Your Personal Data will be retained for as long as it is necessary
              to fulfill the purpose for which it is collected or for business
              or legal purposes, or in accordance with applicable laws.
            </p>
            <p className="mb-1">
              Should you choose to unsubscribe from our mailing list or if your
              membership expires, please note that your Personal Data may still
              be retained on our database to the extent permitted by law.
            </p>
          </div>

          <div className="mb-4">
            <h3 className="font-bold mb-2">SECURITY</h3>
            <p className="mb-1">
              We take reasonable care to keep your Personal Data secure, but we
              cannot be held liable for any loss you may suffer for unauthorized
              access or loss of any data provided to Group Websites.
            </p>
            <p className="mb-1">
              We cannot guarantee the security of data that you choose to send
              us electronically. Sending such information is entirely at your
              own risk.
            </p>
          </div>

          <div className="mb-4">
            <h3 className="font-bold mb-2">
              ACCESSING AND AMENDING YOUR PERSONAL DATA
            </h3>
            <p className="mb-1">
              You may review and amend your Personal Data, or withdraw your
              consent to our use of your Personal Data, at any time by signing
              into your user account (where applicable) and selecting “Update
              Profile” (or equivalent) or by contacting us as follows:
            </p>
            <p className="mb-1">
              <span className="underline text-blue-400">
                Email: dpo@fnnfoods.com
              </span>
              <br /> When contacting the Data Protection Officer for assistance,
              please state (where relevant), your name, address, contact details
              and Customer/Membership Number.
            </p>
            <p className="mb-1">
              Please allow ten (10) working days for your request to be
              processed.
            </p>
            <p className="mb-1">
              If you withdraw your consent to any or all use of your Personal
              Data, depending on the nature of your request, we may not be able
              to provide or continue providing our products and services to you,
              or administer any contractual relationship already in place. You
              understand and agree that in such instances where we require your
              Personal Data to fulfil a contractual obligation to you and you
              withdraw your consent to collect, use or disclose the relevant
              Personal Data for those purposes, we cannot be held liable for
              breach of that agreement. Our legal rights and remedies in such
              event are expressly reserved.
            </p>
          </div>

          <div className="mb-4">
            <h3 className="font-bold mb-2">CHANGES TO THE PRIVACY STATEMENT</h3>
            <p className="mb-1">
              Any changes we may make to our privacy statement in the future
              will be posted on this website and, where appropriate, notified to
              you by e-mail. Please check back frequently to see any updates or
              changes to our privacy statement.
            </p>
          </div>

          <div className="mb-4">
            <h3 className="font-bold mb-2">CONTACT US</h3>
            <p className="mb-1">
              All other questions on our use of your Personal Data should be
              sent to{" "}
              <span className="underline text-blue-400">dpo@fnnfoods.com</span>
            </p>
          </div>
        </div>

        <Link
          href="/register"
          className="block mt-4 mx-auto w-full rounded-md border border-white/30 bg-black/60 py-3 text-center font-bold"
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
