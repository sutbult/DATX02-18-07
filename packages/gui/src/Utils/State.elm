module Utils.State exposing
    ( foldMsg
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
