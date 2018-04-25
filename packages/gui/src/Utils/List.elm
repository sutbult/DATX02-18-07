module Utils.List exposing
    ( nub
    , singletonWhen
    , takeWhilePlusOne
    )


nub : List a -> List a
nub list =
    case list of
        [] ->
            []

        x :: xs ->
            if List.member x xs then
                nub xs
            else
                x :: nub xs


singletonWhen : Bool -> v -> List v
singletonWhen cond value =
    if cond then
        [value]
    else
        []


takeWhilePlusOne : (a -> Bool) -> List a -> List a
takeWhilePlusOne cond list =
    case list of
        [] ->
            []

        (x :: rest) ->
            if cond x then
                x :: takeWhilePlusOne cond rest

            else
                [x]
