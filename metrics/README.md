# Przykład ingestu

http POST https://metrics-6gifihj0j-mywifechino.vercel.app/api/ingest \
 'X-Vercel-Protection-Bypass: Eq6kjKsod6nnrPGZ3AOObPbbkjVLyjhQ' \
 expectedPension:=4200.50 \
 age:=45 \
 gender='kobieta' \
 salary:=11200.00 \
 includesSicknessPeriods:=true \
 zusBalance:=185000.75 \
 actualPension:=3980.20 \
 adjustedPension:=4105.10 \
 postalCode='00-950'

# Przykład exportu

http --download GET https://metrics-6gifihj0j-mywifechino.vercel.app/api/export \
 'X-Vercel-Protection-Bypass: Eq6kjKsod6nnrPGZ3AOObPbbkjVLyjhQ' \
 "Authorization: Token ${ADMIN_KEY}"

# Przykład summary

http POST https://metrics-6gifihj0j-mywifechino.vercel.app/api/summary \
 'X-Vercel-Protection-Bypass: Eq6kjKsod6nnrPGZ3AOObPbbkjVLyjhQ' \
 expectedPension:=4200.50 \
 age:=45 \
 gender='kobieta' \
 salary:=11200.00 \
 includesSicknessPeriods:=true \
 zusBalance:=185000.75 \
 actualPension:=3980.20 \
 adjustedPension:=4105.10 \
 postalCode='00-950'

Limit: maksymalnie 10 zapytań na minutę.

# Wymagane zmienne środowiskowe

- `TURSO_DATABASE_URL`
- `TURSO_AUTH_TOKEN`
- `ADMIN_KEY`
- `OPENAI_KEY`
