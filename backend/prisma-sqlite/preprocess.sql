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

UPDATE pokemon_v2_pokemonsprites
SET sprites = json_set(
    sprites,
    '$.other.home.front_default',
    'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/' || pokemon_id || '.png',
    '$.other.home.front_shiny',
    'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/shiny/' || pokemon_id || '.png'
)
WHERE
    pokemon_id BETWEEN 10278 AND 10325
    AND json_extract(sprites, '$.other.home.front_default') IS NULL;
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
