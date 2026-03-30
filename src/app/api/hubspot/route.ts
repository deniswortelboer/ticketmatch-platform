import { NextResponse } from "next/server";

const HUBSPOT_TOKEN = process.env.HUBSPOT_PRIVATE_APP_TOKEN!;
const HUBSPOT_API = "https://api.hubapi.com";
const PIPELINE_ID = "3692254429"; // SaaS & Affiliate
const FIRST_STAGE_ID = "5103192256"; // Discover

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { companyName, contactName, email, phone, companyType } = body;

    // 1. Create or update contact in HubSpot
    const contactRes = await fetch(`${HUBSPOT_API}/crm/v3/objects/contacts`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HUBSPOT_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        properties: {
          email,
          firstname: contactName.split(" ")[0],
          lastname: contactName.split(" ").slice(1).join(" ") || "",
          phone,
          company: companyName,
          jobtitle: companyType,
        },
      }),
    });

    let contactId: string;
    if (contactRes.ok) {
      const contactData = await contactRes.json();
      contactId = contactData.id;
    } else if (contactRes.status === 409) {
      // Contact already exists — get existing ID
      const conflict = await contactRes.json();
      contactId = conflict.message?.match(/Existing ID: (\d+)/)?.[1] || "";
    } else {
      const err = await contactRes.text();
      return NextResponse.json({ error: `Contact creation failed: ${err}` }, { status: 500 });
    }

    // 2. Create deal in SaaS & Affiliate pipeline
    const dealRes = await fetch(`${HUBSPOT_API}/crm/v3/objects/deals`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HUBSPOT_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        properties: {
          dealname: `TicketMatch Signup — ${companyName}`,
          pipeline: PIPELINE_ID,
          dealstage: FIRST_STAGE_ID,
          description: `New signup from TicketMatch.ai platform. Company type: ${companyType}`,
        },
      }),
    });

    if (!dealRes.ok) {
      const err = await dealRes.text();
      return NextResponse.json({ error: `Deal creation failed: ${err}` }, { status: 500 });
    }

    const dealData = await dealRes.json();

    // 3. Associate contact with deal
    if (contactId) {
      await fetch(
        `${HUBSPOT_API}/crm/v3/objects/deals/${dealData.id}/associations/contacts/${contactId}/deal_to_contact`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${HUBSPOT_TOKEN}`,
            "Content-Type": "application/json",
          },
        }
      );
    }

    return NextResponse.json({ success: true, dealId: dealData.id });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
