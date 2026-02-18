INSERT INTO pokemon_v2_pokemonformname (pokemon_name, pokemon_form_id, language_id, name)
SELECT
    '',
    pf.id,
    12,
    '超级巨的样子'
FROM
    pokemon_v2_pokemonform pf
JOIN
    pokemon_v2_pokemon p ON pf.pokemon_id = p.id
WHERE
    p.name LIKE '%-gmax';
INSERT INTO pokemon_v2_pokemonformname (pokemon_name, pokemon_form_id, language_id, name)
SELECT
    '',
    pf.id,
    4,
    '超極巨的樣子'
FROM
    pokemon_v2_pokemonform pf
JOIN
    pokemon_v2_pokemon p ON pf.pokemon_id = p.id
WHERE
    p.name LIKE '%-gmax';
