module Utils.Maybe exposing
    ( isJust
    )


isJust : Maybe a -> Bool
isJust maybe =
    case maybe of
        Just _ ->
            True

        Nothing ->
            False
