module Utils.State exposing
    ( foldMsg
    , with
    )


foldMsg
    :  (msg -> model -> (model, Cmd msg))
    -> model
    -> List msg
    -> (model, Cmd msg)

foldMsg fn model =
    List.foldl (updateCmd fn) (model, Cmd.none)


updateCmd
    :  (msg -> model -> (model, Cmd msg))
    -> msg
    -> (model, Cmd msg)
    -> (model, Cmd msg)

updateCmd fn msg (model, cmd) =
    let
        (nmodel, ncmd) = fn msg model
    in
        nmodel ! [cmd, ncmd]

with
    :  model
    -> Maybe a
    -> (a -> (model, Cmd msg))
    -> (model, Cmd msg)

with model maybe fn =
    case maybe of
        Just value ->
            fn value

        Nothing ->
            (model, Cmd.none)
