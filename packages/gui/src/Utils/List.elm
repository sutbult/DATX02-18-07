module Utils.List exposing
    ( nub
    , singletonWhen
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
