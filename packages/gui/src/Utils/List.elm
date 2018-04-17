module Utils.List exposing (..)


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
