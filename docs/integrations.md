# Integrations

## VIN decoding
Uses NHTSA VPIC API at `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVin/{vin}?format=json`.

## Email providers
Adapters for SendGrid and Mailgun should store API keys encrypted with `ENCRYPTION_SECRET`.

## SMS
Twilio integration requires account SID, auth token, and provisioned phone number per tenant.

## Parts/Labor
Use the Demo provider in development. Paid providers require contract access; wire credentials and endpoints as per vendor documentation.
