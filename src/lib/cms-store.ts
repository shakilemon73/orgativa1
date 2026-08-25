import { supabase } from "./supabase";

export interface FAQItem {
  id: string;
  category: "authenticity" | "shipping" | "payment" | "products" | "general";
  questionBn: string;
  questionEn: string;
  answerBn: string;
  answerEn: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  titleBn: string;
  titleEn: string;
  summaryBn: string;
  summaryEn: string;
  contentBn: string;
  contentEn: string;
  categoryBn: string;
  categoryEn: string;
  author: string;
  date: string;
  readTime: string;
  image: string;
  featured?: boolean;
}

export interface PageContent {
  titleBn: string;
  titleEn: string;
  subtitleBn: string;
  subtitleEn: string;
  contentBn: string;
  contentEn: string;
  lastUpdated?: string;
}

export interface CMSData {
  shipping_policy: PageContent;
  returns_refund: PageContent;
  privacy_policy: PageContent;
  terms_service: PageContent;
  our_story: PageContent;
  faqs: FAQItem[];
  blog_posts: BlogPost[];
  contact_info: {
    phone: string;
    hotlineHours: string;
    email: string;
    corpEmail: string;
    address: string;
    whatsapp: string;
    facebook: string;
    instagram: string;
  };
}

export const DEFAULT_CMS_DATA: CMSData = {
  shipping_policy: {
    titleBn: "শিপিং ও ডেলিভারি নীতি",
    titleEn: "Shipping & Delivery Policy",
    subtitleBn: "সারা বাংলাদেশে দ্রুত, নিরাপদ ও সতেজ হোম ডেলিভারি",
    subtitleEn: "Fast, Safe & Eco-Packaged Delivery Across All 64 Districts in Bangladesh",
    contentBn: `### ১. ডেলিভারি চার্জ ও সময়সীমা
- **ঢাকা সিটির ভেতরে:** ডেলিভারি চার্জ ৳৬০ টাকা। অর্ডারের ২৪ থেকে ৪৮ ঘণ্টার মধ্যে ডেলিভারি সম্পন্ন হয়।
- **ঢাকার বাইরে (সারা বাংলাদেশ):** ডেলিভারি চার্জ ৳১২০ টাকা। অর্ডারের ২ থেকে ৪ কার্যদিবসের মধ্যে ডেলিভারি সম্পন্ন হয়।
- **ফ্রি হোম ডেলিভারি:** ১,৫০০ টাকা বা তার বেশি টাকার কেনাকাটায় সারা বাংলাদেশে ডেলিভারি সম্পূর্ণ ফ্রি!

### ২. ক্যাশ অন ডেলিভারি ও পার্সেল পরীক্ষা
- আমরা সারা বাংলাদেশে ক্যাশ অন ডেলিভারি (Cash on Delivery) সুবিধা প্রদান করি।
- ডেলিভারিম্যান উপস্থিত থাকাকালীন পার্সেল খুলে পণ্যের গুণগত মান ও অক্ষত অবস্থা পরীক্ষা করে মূল্য পরিশোধ করার সুযোগ রয়েছে।

### ৩. প্রিমিয়াম অ্যান্ড ইকো-ফ্রেন্ডলি প্যাকেজিং
- আমাদের কাচের বোতলে থাকা খাঁটি মধু, ঘি ও কোল্ড-প্রেসড অয়েল নিরাপদ রাখতে বিশেষ শক-প্রুফ বাবল প্যাডিং ও শক্ত কাটুন বক্স ব্যবহার করা হয়।
- ড্রাই ফ্রুটস ও হার্বাল গুঁড়া এয়ারটাইট ভ্যাকুয়াম সিলেকশনে প্যাক করা হয় যাতে সতেজতা ১০০% বজায় থাকে।

### ৪. ডেলিভারি পার্টনারসমূহ
আমরা স্টিডফাস্ট (Steadfast Courier), পাঠাও কুরিয়ার, রেড-এক্স এবং সুন্দরবন কুরিয়ার সার্ভিস এর সাথে যৌথভাবে কাজ করি।`,
    contentEn: `### 1. Delivery Rates & Timelines
- **Inside Dhaka City:** Standard delivery fee ৳60. Orders are delivered within 24 to 48 hours.
- **Outside Dhaka (Nationwide):** Standard delivery fee ৳120. Delivered within 2 to 4 working days.
- **Free Home Delivery:** Enjoy 100% Free Shipping across Bangladesh on all orders over ৳1,500!

### 2. Cash on Delivery & Open-Box Verification
- We offer Cash on Delivery (COD) services to all 64 districts in Bangladesh.
- Customers have the right to inspect the package upon courier arrival before making payment.

### 3. Eco-Friendly & Shockproof Packaging
- All liquid items (Honey, Raw Ghee, Cold-Pressed Mustard & Olive Oils) are enclosed in double-walled bubble wrapping and reinforced hardboard boxes.
- Dry fruits, nuts, and herbal powders are sealed in airtight vacuum packs to retain natural aroma and freshness.

### 4. Logistics & Delivery Partners
We partner with Steadfast Courier, Pathao Courier, RedX Logistics, and Sundarban Courier for prompt last-mile delivery.`,
    lastUpdated: "2026-08-01"
  },

  returns_refund: {
    titleBn: "রিটার্ন ও রিফান্ড নীতি",
    titleEn: "Returns & Refund Policy",
    subtitleBn: "১০০% গ্রাহক সন্তুষ্টি এবং সহজ ৭ দিনের টাকা ফেরত গ্যারান্টি",
    subtitleEn: "100% Customer Satisfaction & 7-Day Money-Back Guarantee",
    contentBn: `### ১. ১০০% গ্যারান্টিড রিটার্ন পলিসি
আমরা Orgativa-তে প্রতিটি খাদ্য উপাদানের বিশুদ্ধতায় বিশ্বাস করি। যদি পণ্য পাওয়ার পর কোনো ত্রুটি, বোতল ভাঙা বা গুণগত মানের ভিন্নতা পান, তবে ৭ দিনের মধ্যে আমাদের জানালে আমরা সম্পূর্ণ বিনামূল্যে নতুন পণ্য পাঠাব।

### ২. রিফান্ড প্রক্রিয়া ও সময়সীমা
- ডেলিভারি নেওয়ার সময় কোনো পণ্য ক্ষতিগ্রস্ত হলে বা অর্ডারের সাথে মিল না থাকলে সরাসরি রিফান্ড দাবি করতে পারবেন।
- আপনার প্রদানকৃত বিকাশ (bKash), নগদ (Nagad), রকেট বা ব্যাংক অ্যাকাউন্টে ২৪ থেকে ৪৮ ঘণ্টার মধ্যে রিফান্ডের টাকা পাঠিয়ে দেওয়া হয়।

### ৩. রিটার্নের শর্তাবলী
- ভুল বা ক্ষতিগ্রস্ত পণ্য প্রাপ্তির ছবি বা ছোট ভিডিও ক্লিপ আমাদের হোয়াটসঅ্যাপ (+8801700000000) অথবা হটলাইনে মেসেজ দিন।
- পণ্যটির ব্যবহার না করে মূল প্যাকেজিং সহ সংরক্ষণ করুন।

### ৪. কীভাবে সাপোর্ট পাবেন?
আপনার অর্ডারের যেকোনো সমস্যার জন্য হটলাইন: **+880 1700-000000** অথবা ইমেইল করুন: **support@orgativa.com.bd**`,
    contentEn: `### 1. 100% Satisfaction Guarantee
At Orgativa, we stand unreservedly behind the purity of our organic food products. If you receive a damaged jar, leaked container, or incorrect item, we will replace it free of charge within 7 days.

### 2. Instant Refund Timeline
- If an item is damaged in transit or fails your purity standards, you are eligible for a 100% immediate refund.
- Refunds are dispatched directly to your bKash, Nagad, Rocket, or Bank account within 24–48 hours.

### 3. Return Conditions
- Simply send a photo or quick video clip of the package via WhatsApp (+8801700000000) or email.
- Ensure the original bottle/jar and receipt are retained for courier collection.

### 4. Need Assistance?
Call our dedicated customer support helpline at **+880 1700-000000** or email **support@orgativa.com.bd**.`,
    lastUpdated: "2026-08-01"
  },

  privacy_policy: {
    titleBn: "গোপনীয়তা নীতি",
    titleEn: "Privacy Policy",
    subtitleBn: "আপনার ব্যক্তিগত তথ্যের নিরাপত্তা ও সম্পূর্ণ গোপনীয়তা রক্ষার প্রতিশ্রুতি",
    subtitleEn: "How Orgativa Safeguards Your Personal Information and Order Privacy",
    contentBn: `### ১. সংগৃহীত তথ্যের ধরণ
আপনার অর্ডার নিরাপদে ডেলিভারি করার উদ্দেশ্যে আমরা আপনার নাম, ফোন নম্বর, ডেলিভারি ঠিকানা এবং ইমেইল সংগ্রহ করে থাকি।

### ২. এনক্রিপশন ও ডেটা নিরাপত্তা
- আপনার প্রদানকৃত সমস্ত তথ্য SSL-এনক্রিপশন প্রযুক্তির মাধ্যমে সুরক্ষিত থাকে।
- আপনার কোনো গোপনীয় পেমেন্ট পিন বা পাসওয়ার্ড আমাদের সার্ভারে সংরক্ষিত হয় না।

### ৩. থার্ড-পার্টি শেয়ারিং মুক্ত
Orgativa কখনোই গ্রাহকদের ব্যক্তিগত তথ্য কোনো বাণিজ্যিক বিজ্ঞাপনী সংস্থা বা থার্ড-পার্টি প্রতিষ্ঠানের কাছে বিক্রয় বা শেয়ার করে না। শুধুমাত্র ডেলিভারির প্রয়োজনে নিবন্ধিত কুরিয়ার পার্টনারকে ঠিকানা ও ফোন নম্বর প্রদান করা হয়।

### ৪. কুকিজ ও সাইট পারফরম্যান্স
আমাদের ওয়েবসাইট দ্রুত ও মসৃণভাবে পরিচালনার জন্য সাধারণ কুকিজ ব্যবহার করা হয় যা আপনার অভিজ্ঞতা আরও সহজ করে তোলে।`,
    contentEn: `### 1. Personal Information Collected
We strictly collect necessary checkout information—such as your Name, Phone Number, Delivery Address, and Email—solely for order fulfillment and tracking.

### 2. SSL Encryption & Data Security
All communications between your device and Orgativa servers are secured with 256-bit SSL encryption. We do not store financial credentials or mobile wallet PINs.

### 3. Zero Third-Party Selling
We never sell, trade, or rent your personal information to marketing firms or third parties. Delivery details are shared exclusively with certified courier operators.

### 4. Cookies & Site Optimization
Small browser cookies are utilized to preserve your shopping cart items and language preferences across browser visits.`,
    lastUpdated: "2026-08-01"
  },

  terms_service: {
    titleBn: "সেবার শর্তাবলী",
    titleEn: "Terms of Service",
    subtitleBn: "Orgativa অনলাইন শপ ব্যবহারের সুনির্দিষ্ট নিয়ম ও শর্তাবলী",
    subtitleEn: "Terms & Conditions Governing Your Orders and Store Use",
    contentBn: `### ১. অ্যাকাউন্টের শর্তাবলী
Orgativa প্ল্যাটফর্মে অর্ডার করার মাধ্যমে আপনি নিশ্চিত করছেন যে প্রদানকৃত নাম, ফোন নম্বর ও ডেলিভারি ঠিকানা সম্পূর্ণ সত্য ও সঠিক।

### ২. পণ্যের মূল্য ও বিবরণ
- আমাদের সকল পণ্যের মূল্য বাংলাদেশ টাকায় (BDT/৳) নির্ধারিত।
- অফার বা প্রমোটের সময় মূল্য পরিবর্তনের অধিকার Orgativa কর্তৃপক্ষ সংরক্ষণ করে।

### ৩. বিশুদ্ধতার নিশ্চয়তা
আমরা প্রতিটি খামারের মালামাল ল্যাব পরীক্ষার মাধ্যমে বাজারজাত করি। প্রাকৃতিক মধু ও তেলের ঘনত্ব আবহাওয়া ভেদে সামান্য পরিবর্তন হতে পারে, যা প্রাকৃতিক বৈশিষ্ট্যের অন্তর্ভুক্ত।

### ৪. আইনগত এখতিয়ার
এই ব্যবহারের শর্তাবলী গণপ্রজাতন্ত্রী বাংলাদেশের প্রচলিত আইন দ্বারা পরিচালিত ও নিয়ন্ত্রিত।`,
    contentEn: `### 1. Order Terms & Accuracy
By placing an order on Orgativa, you warrant that the recipient name, delivery address, and contact details provided are truthful and accurate.

### 2. Pricing & Currency
All prices listed on the Orgativa website are in Bangladeshi Taka (BDT/৳) and inclusive of applicable government VAT.

### 3. Organic Authenticity Guarantee
We certify that all items are 100% natural and chemical-free. Natural variations in honey crystallization or mustard oil viscosity due to seasonal weather changes are intrinsic properties of unrefined organic foods.

### 4. Governing Law
These terms are governed by and construed in accordance with the laws of the People's Republic of Bangladesh.`,
    lastUpdated: "2026-08-01"
  },

  our_story: {
    titleBn: "আমাদের গল্প ও অর্গানিক অঙ্গীকার",
    titleEn: "Our Story & Organic Promise",
    subtitleBn: "প্রকৃতির বিশুদ্ধতা সরাসরি প্রান্তিক খামার থেকে আপনার পরিবারে",
    subtitleEn: "Reviving Pure, Unadulterated Nature Directly From Certified Eco-Farms",
    contentBn: `### খাদ্যে ভেজালমুক্ত বাংলাদেশ গড়ার স্বপ্ন
আজকের বাণিজ্যিক খাদ্যের যুগে যেখানে রাসায়নিক প্রিজারভেটিভ ও কৃত্রিম রং খাদ্যকে অনিরাপদ করে তুলেছে, ঠিক তখনই ২০২৪ সালে **Orgativa**-এর যাত্রা শুরু হয়। আমাদের প্রধান লক্ষ্য—বাংলাদেশের প্রতিটি ঘরে শতভাগ আসল, ল্যাব-পরীক্ষিত ও রাসায়নিকমুক্ত জৈব খাদ্য পৌঁছে দেওয়া।

### প্রান্তিক কৃষকদের সাথে সরাসরি অংশীদারিত্ব
আমরা কোনো মধ্যস্বত্বভোগী বা দালাল ছাড়াই সরাসরি সুন্দরবনের ঐতিহ্যবাহী মৌয়ালদের থেকে খাঁটি পদ্ম ও খলিসা ফুল মধু, সিলেটের অর্গানিক চা বাগান থেকে প্রথম বসন্তের চা পাতা, এবং রাজশাহীর কৃষকদের খামার থেকে ভেজালমুক্ত সরিষা ও ঘি সংগ্রহ করি।

### ৩-ধাপের ল্যাব পরীক্ষা ও কোয়ালিটি কন্ট্রোল
১. **উৎস পরীক্ষা:** খামার পর্যায়ে সরাসরি মাটির গুণগত মান ও কীটনাশক মুক্ততা যাচাই।
২. **ল্যাব টেস্ট:** প্রতি ব্যাচের মধুতে হাইড্রক্সিমিথাইলফারফুরাল (HMF) ও পাম অয়েল ভেজাল পরীক্ষা।
৩. **সুরক্ষিত প্যাকেজিং:** অ্যান্টি-মাইক্রোবিয়াল ফুড-গ্রেড প্যাকেজিং ব্যবহার।

### আমাদের ৪টি মূল স্তম্ভ
- **১০০% প্রাকৃতিক:** কোনো কৃত্রিম ঘ্রাণ, প্রিজারভেটিভ বা কেমিক্যাল মুক্ত।
- **কৃষক ক্ষমতায়ন:** গ্রামীণ কৃষকদের ন্যায্য মূল্য ও উন্নত জীবনযাত্রার সুযোগ প্রদান।
- **স্বচ্ছতা:** প্রতি পণ্যের নিউট্রিশন ও টেস্ট রিপোর্ট গ্রাহকদের জন্য উন্মুক্ত।
- **টেকসই প্রকৃতি:** পরিবেশ বান্ধব প্লাস্টিকমুক্ত প্যাকিং ও সবুজ বাংলাদেশ গড়ার উদ্যোগ।`,
    contentEn: `### Championing Pure Nutrition in Bangladesh
In an era dominated by synthetic additives, chemical preservatives, and adulterated food, **Orgativa** was founded to reclaim pure, traditional nutrition. We exist to restore complete faith in everyday organic foods across Bangladesh.

### Direct Partnership with Artisanal Eco-Farmers
By eliminating middlemen and brokers, we partner directly with native Mouwals (traditional honey harvesters) in the Sundarbans, high-altitude tea growers in Sylhet, and cold-pressed mustard oil mills in Rajshahi.

### 3-Tier Quality Control & Lab Certification
1. **Soil & Origin Audit:** Verification of chemical-free eco-farming practices at the field level.
2. **Laboratory Testing:** Advanced testing for added sugar, heavy metals, and adulterants in every single batch.
3. **Hygiene & Sealed Packaging:** Certified food-grade bottling ensuring zero contamination.

### Core Values & Pillars
- **100% Pure & Unadulterated:** Zero artificial flavors, colorings, or synthetic additives.
- **Fair Trade & Farmer Support:** Empowering indigenous Bangladeshi agricultural workers with equitable wages.
- **Total Transparency:** Clear nutritional labels and lab reports accessible to every customer.
- **Sustainability:** Recyclable packaging and eco-conscious logistics.`,
    lastUpdated: "2026-08-01"
  },

  faqs: [
    {
      id: "faq-1",
      category: "authenticity",
      questionBn: "সুন্দরবনের মধু খাঁটি কিনা তা নিশ্চিত হব কীভাবে?",
      questionEn: "How can I verify that Orgativa Sundarbans Honey is 100% pure?",
      answerBn: "আমাদের সুন্দরবনের খাঁটি মধু সরাসরি পদাতিক মৌয়ালদের দ্বারা প্রাকৃতিকভাবে সংগ্রহ করা হয়। প্রতি ব্যাচ মধু ন্যাশনাল ল্যাব টেস্ট করা হয় যাতে কোনো চিনি বা ভেজাল নেই তা নিশ্চিত করা হয়। আপনি ঘরে বসে পানির গ্লাসে এক ড্রপ ফেলে এটি পরীক্ষা করতে পারেন—খাঁটি মধু না গুলিয়ে নিচে জমা হবে।",
      answerEn: "Every batch of Orgativa Sundarbans Honey is laboratory tested to guarantee zero added sugar or artificial syrups. Pure honey settles cleanly at the bottom of a water glass without dissolving instantly."
    },
    {
      id: "faq-2",
      category: "authenticity",
      questionBn: "ঘি জমাট বেঁধে যাওয়া কি স্বাভাবিক?",
      questionEn: "Is it normal for hand-churned ghee to solidify or granulate?",
      answerBn: "হ্যাঁ! খাঁটি গাওয়া ঘি আবহাওয়ার তাপমাত্রার ওপর নির্ভর করে জমাট বাঁধে অথবা দানাদার হয়। এটি আসল গাভীর দুধের মাখন দিয়ে হাতে প্রস্তুত ঘি-এর অন্যতম প্রধান বৈশিষ্ট্য।",
      answerEn: "Yes! Pure traditional hand-churned cow ghee naturally granulates (danedar) and solidifies at room temperature, which is a signature proof of authentic unrefined butterfat."
    },
    {
      id: "faq-3",
      category: "shipping",
      questionBn: "ডেলিভারি চার্জ কত এবং ফ্রি ডেলিভারি পাব কীভাবে?",
      questionEn: "What are the shipping charges and how do I get Free Shipping?",
      answerBn: "ঢাকা সিটিতে ডেলিভারি চার্জ ৳৬০ এবং ঢাকার বাইরে ৳১২০। তবে যেকোনো ১,৫০০ টাকা বা তার বেশি টাকার অর্ডারে সারা বাংলাদেশে ডেলিভারি ১০০% ফ্রি!",
      answerEn: "Delivery inside Dhaka is ৳60 and outside Dhaka is ৳120. All orders over ৳1,500 automatically qualify for FREE nationwide shipping!"
    },
    {
      id: "faq-4",
      category: "shipping",
      questionBn: "ক্যাশ অন ডেলিভারিতে পার্সেল চেক করার সুযোগ আছে কি?",
      questionEn: "Can I inspect the package upon Cash on Delivery arrival?",
      answerBn: "অবশ্যই! ডেলিভারিম্যান উপস্থিত থাকা অবস্থায় আপনি রাইডারের সামনে বোতল বা প্যাকিং অক্ষত আছে কিনা চেক করতে পারবেন।",
      answerEn: "Absolutely! You are fully encouraged to open and verify the parcel in front of the delivery rider before handing over the payment."
    },
    {
      id: "faq-5",
      category: "payment",
      questionBn: "কোন কোন পেমেন্ট মেথড সাপোর্ট করে?",
      questionEn: "What payment methods are supported on Orgativa?",
      answerBn: "আমরা বিকাশ (bKash), নগদ (Nagad), রকেট (Rocket), ডাইরেক্ট ব্যাংক ট্রান্সফার এবং ক্যাশ অন ডেলিভারি (COD) পেমেন্ট সাপোর্ট করি।",
      answerEn: "We support bKash, Nagad, Rocket, Direct Bank Transfer (BRAC Bank), and Cash on Delivery (COD)."
    },
    {
      id: "faq-6",
      category: "products",
      questionBn: "সরিষার তেল কি কাঠের ঘানি ভাঙা?",
      questionEn: "Is Orgativa Mustard Oil truly cold-pressed on wood mills?",
      answerBn: "হ্যাঁ, আমাদের সরিষার তেল ১০০% দেশি সরিষা থেকে কাঠের ঘানিতে ঠান্ডা চাপে (Cold-Pressed) মাড়ানো হয়, যার ফলে প্রাকৃতিক খাঁঝ ও পুষ্টিমান অটুট থাকে।",
      answerEn: "Yes, our mustard oil is 100% cold-pressed on traditional wooden mills at low temperatures to preserve natural pungent aroma, Vitamin E, and antioxidants."
    }
  ],

  blog_posts: [
    {
      id: "post-1",
      slug: "how-to-test-pure-honey-at-home",
      titleBn: "ঘরে বসেই সুন্দরবনের খাঁটি মধু চেনার ৫টি সহজ উপায়",
      titleEn: "5 Simple Ways to Test Pure Honey Authenticity at Home",
      summaryBn: "বাজারে প্রচলিত খাঁটি মধুর ভিড়ে আসল সুন্দরবনের মধু কীভাবে চিনবেন? জানুন ৫টি বৈজ্ঞানিক ও প্রচলিত সহজ পরীক্ষা।",
      summaryEn: "How to distinguish real raw Sundarbans honey from sugar-adulterated syrups. Learn 5 easy home purity tests.",
      categoryBn: "বিশুদ্ধতা পরীক্ষা",
      categoryEn: "Purity Guide",
      author: "Dr. Farhana Rahman (Nutritionist)",
      date: "August 20, 2026",
      readTime: "4 min read",
      image: "https://images.unsplash.com/photo-1587049352847-4a222e784d38?auto=format&fit=crop&w=1000&q=80",
      featured: true,
      contentBn: `খাঁটি মধু প্রকৃতির এক অপার নেয়ামত। কিন্তু বাজারে চিনি ও গ্লুকোজের ভেজাল সিন্ডিকেটের কারণে অনেকেই আসল মধু চিনতে পারেন না। নিচে ৫টি ঘরোয়া পরীক্ষার মাধ্যমে সহজে মধু পরীক্ষা করুন:

### ১. পানির গ্লাসের পরীক্ষা (Water Drop Test)
এক গ্লাস পরিষ্কার পানির মধ্যে এক চামচ মধু আস্তে ছেড়ে দিন। মধু যদি চিনি মিশ্রিত হয় তবে তা পানিতে দ্রুত গলে মিশে যাবে। কিন্তু খাঁটি সুন্দরবনের মধু কোনো রকম না গলে একদম নিচে জমাট হয়ে বসে থাকবে।

### ২. বুদ্বুদ ও ফেনা পরীক্ষা (Thumb Test)
আপনার বৃদ্ধা আঙুলে সামান্য মধু নিয়ে দেখুন। আসল মধু আঙুলে থকথকে অবস্থায় আটকে থাকবে এবং সহজে ছড়িয়ে পড়বে না।

### ৩. দেশলাই কাঠির পরীক্ষা (Matchstick Test)
একটি শুষ্ক দেশলাই কাঠি মধুতে ডুবিয়ে নিয়ে জ্বালানোর চেষ্টা করুন। মধু খাঁটি হলে কাঠিটি সঙ্গে সঙ্গে জ্বলে উঠবে কারণ খাঁটি মধুতে আর্দ্রতার পরিমাণ ১৮% এর কম থাকে।

### ৪. টিস্যু পেপার পরীক্ষা (Paper Test)
ব্লটিং পেপার বা টিস্যু পেপারের ওপর কয়েক ফোঁটা মধু দিন। যদি টিস্যু মধু শুষে নেয় বা পেপারের উল্টো পিঠ ভেজে যায়, তবে তাতে পানি ও চিনির মিশ্রণ আছে।

### ৫. প্রাকৃতিক সুবাস ও খাঁঝ
সুন্দরবনের প্রাকৃতিক খলিসা বা পদ্ম মধুর এক অনন্য ফুল ও বনের সুবাস থাকে, যা কৃত্রিম চিনির শিরায় পাওয়া অসম্ভব।`,
      contentEn: `Pure raw honey is one of nature's greatest superfoods. However, widespread syrup adulteration makes identifying genuine honey essential. Here are 5 practical tests:

### 1. The Water Drop Test
Drop a teaspoon of honey into a glass of clean room-temperature water. Adulterated honey immediately dissolves and clouds the water. Pure Sundarbans honey settles directly to the bottom in a thick, cohesive lump.

### 2. The Thumb Test
Place a small drop of honey on your thumb. If it spills or spreads around quickly like syrup, it contains added water. Pure honey stays intact as a dense bead.

### 3. The Matchstick Test
Dip the tip of a dry matchstick into the honey and strike it against the box. Pure honey will still ignite easily because genuine raw honey contains less than 18% moisture.

### 4. Blotting Paper Test
Drop honey onto a paper towel or blotting paper. Fake honey leaves a damp wet ring around the drop because of added water. Pure honey stays beaded on top.

### 5. Aroma & Floral Complexities
Wild forest honey carries complex, woody, and floral undertones that artificial sugar syrup cannot replicate.`
    },
    {
      id: "post-2",
      slug: "health-benefits-of-raw-hand-churned-ghee",
      titleBn: "প্রতিদিন সকালে এক চামচ খাঁটি গাওয়া ঘৃত সেবনের বিস্ময়কর উপকারিতা",
      titleEn: "Astonishing Health Benefits of Having Raw Hand-Churned Ghee Daily",
      summaryBn: "আয়ুর্বেদ ও আধুনিক চিকিৎসাবিজ্ঞানে খাঁটি বিলোনা ঘি-এর ভূমিকা অপরিসীম। জেনে নিন খালি পেটে ঘি সেবনের প্রভাব।",
      summaryEn: "Explore the science-backed health benefits of traditional Bilona cow ghee for gut health and immunity.",
      categoryBn: "স্বাস্থ্য টিপস",
      categoryEn: "Health & Nutrition",
      author: "Kazi Tanjim (Organic Agro Expert)",
      date: "August 15, 2026",
      readTime: "5 min read",
      image: "https://images.unsplash.com/photo-1631451095765-2c91616fc9e6?auto=format&fit=crop&w=1000&q=80",
      featured: false,
      contentBn: `আমাদের দৈনন্দিন খাদ্যাভ্যাসে ঘি একটি অপরিহার্য পুষ্টিকর উপাদান। বিশেষ করে ঐতিহ্যবাহী বিলোনা (Bilona) পদ্ধতিতে তৈরি হাত-মন্থন গাওয়া ঘি-এর স্বাস্থ্য উপকারিতা অনেক:

- **পাচনতন্ত্র ও পেটের স্বাস্থ্য:** ঘি-তে থাকা বিউটারিক অ্যাসিড (Butyric Acid) অন্ত্রের ভেতরের দেয়ালে প্রতিরক্ষা তৈরি করে এবং কোষ্ঠকাঠিন্য দূর করে।
- **মস্তিষ্কের ক্ষমতা ও স্মৃতিশক্তি বৃদ্ধি:** প্রাকৃতিকভাবে ওমেগা-৩ এবং ওমেগা-৯ ফ্যাটি অ্যাসিড সমৃদ্ধ ঘি ব্রেইনের মেমরি ক্ষমতা বৃদ্ধি করে।
- **রোগ প্রতিরোধ ক্ষমতা (Immunity):** ভিটামিন A, D, E এবং K সমৃদ্ধ হওয়ায় এটি শরীরের প্রতিরোধ ক্ষমতা বৃদ্ধি করে।
- **ত্বক ও চুলের উজ্জ্বলতা:** নিয়মিত খাঁটি ঘি সেবনে ত্বক ভেতর থেকে সতেজ ও লাবণ্যময় থাকে।`,
      contentEn: `Traditional hand-churned Bilona Ghee has been revered in Ayurveda and modern nutritional science as a metabolic superfood.

- **Gut & Digestion Support:** Rich in Butyric Acid, ghee nourishes intestinal cells and supports digestive harmony.
- **Brain & Cognitive Function:** Contains essential Omega-3 and Omega-9 fatty acids essential for mental clarity.
- **Immune System Boost:** Packed with fat-soluble vitamins A, D, E, and K that strengthen natural immunity.
- **Radiant Skin & Healthy Joints:** Promotes joint lubrication and natural skin glow from within.`
    },
    {
      id: "post-3",
      slug: "organic-chia-seed-moringa-smoothie-recipe",
      titleBn: "অর্গানিক চিয়া বীজ ও মোরিঙ্গা জুসের রিফ্রেশিং ড্রেক্স রেসিপি",
      titleEn: "Refreshing Organic Chia Seed & Moringa Detox Smoothie Recipe",
      summaryBn: "সারা দিন চাঙ্গা থাকতে ও ওজন নিয়ন্ত্রণে রাখতে ৩ মিনিটে তৈরি করুন পুষ্টিকর চিয়া-মোরিঙ্গা স্মুদি।",
      summaryEn: "A 3-minute nutrient-dense green smoothie recipe featuring organic chia seeds, moringa, and wild honey.",
      categoryBn: "অর্গানিক রেসিপি",
      categoryEn: "Organic Recipes",
      author: "Chef Sumaiya Akter",
      date: "August 10, 2026",
      readTime: "3 min read",
      image: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=1000&q=80",
      featured: false,
      contentBn: `### উপকরণ:
- ২ টেবিল চামচ Orgativa চিয়া বীজ (১৫ মিনিট পানিতে ভিজানো)
- ১ চা চামচ Orgativa মোরিঙ্গা (সজিনা পাতা) পাউডার
- ১ টেবিল চামচ সুন্দরবনের খাঁটি মধু
- ১ গ্লাস কচি ডাবের পানি অথবা কুসুম গরম পানি
- ১ চা চামচ লেবুর রস

### প্রস্তুত প্রণালী:
১. একটি গ্লাসে ডাবের পানি বা হালকা গরম পানি নিন।
২. ভিজিয়ে রাখা ফুলানো চিয়া বীজ ও মোরিঙ্গা পাউডার চামচ দিয়ে ভালো করে মিশিয়ে নিন।
৩. স্বাদ ও অ্যান্টি-অক্সিডেন্ট বাড়াতে খাঁটি মধু ও লেবুর রস দিন।
৪. ভালো করে নেড়ে বরফ ছাড়াই সকালে খালি পেটে পরিবেশন করুন।`,
      contentEn: `### Ingredients:
- 2 tbsp Orgativa Organic Chia Seeds (soaked in water for 15 mins)
- 1 tsp Orgativa Moringa Leaf Powder
- 1 tbsp Sundarbans Wild Honey
- 1 glass Tender Coconut Water or Warm Water
- 1 tsp Fresh Lemon Juice

### Preparation Steps:
1. In a glass, pour fresh coconut water or tepid water.
2. Stir in the soaked gelled chia seeds and moringa powder thoroughly.
3. Add a generous spoonful of wild honey and lemon juice for antioxidant goodness.
4. Enjoy fresh on an empty stomach for maximum energy!`
    }
  ],

  contact_info: {
    phone: "+880 1700-000000",
    hotlineHours: "9:00 AM – 10:00 PM (Everyday)",
    email: "support@orgativa.com.bd",
    corpEmail: "corporate@orgativa.com.bd",
    address: "House 12, Road 5, Block D, Bashundhara R/A, Dhaka-1229, Bangladesh",
    whatsapp: "+8801700000000",
    facebook: "https://facebook.com",
    instagram: "https://instagram.com"
  }
};

// Helper to get CMS Data from LocalStorage/Supabase
export function getCMSData(): CMSData {
  try {
    const saved = localStorage.getItem("orgativa_cms_data");
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...DEFAULT_CMS_DATA,
        ...parsed,
        contact_info: { ...DEFAULT_CMS_DATA.contact_info, ...(parsed.contact_info || {}) }
      };
    }
  } catch (e) {
    console.error("Error reading local CMS data:", e);
  }
  return DEFAULT_CMS_DATA;
}

// Helper to save CMS Data
export async function saveCMSData(data: CMSData): Promise<boolean> {
  try {
    localStorage.setItem("orgativa_cms_data", JSON.stringify(data));
    
    // Also sync key policy & cms settings to Supabase site_settings table if connected
    if (supabase) {
      const settingsToUpsert = [
        { key: "cms_data_json", value: JSON.stringify(data) },
        { key: "contact_phone", value: data.contact_info.phone },
        { key: "contact_email", value: data.contact_info.email },
        { key: "contact_address", value: data.contact_info.address },
        { key: "contact_whatsapp", value: data.contact_info.whatsapp },
      ];
      await supabase.from("site_settings").upsert(settingsToUpsert, { onConflict: "key" });
    }
    return true;
  } catch (e) {
    console.error("Error saving CMS data:", e);
    return false;
  }
}
