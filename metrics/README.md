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
